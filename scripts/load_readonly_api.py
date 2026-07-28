#!/usr/bin/env python3
"""Bounded, read-only load probe for an approved NIUVA environment."""

from __future__ import annotations

import argparse
import json
import math
import time
from concurrent.futures import ThreadPoolExecutor
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


def percentile(values: list[float], percentage: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, math.ceil((percentage / 100) * len(ordered)) - 1)
    return ordered[index]


def validate_origin(value: str, *, allow_http_local: bool) -> str:
    parsed = urlsplit(value)
    local = parsed.hostname in {"127.0.0.1", "localhost"}
    if (
        not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
        or parsed.path not in {"", "/"}
        or parsed.scheme not in {"http", "https"}
        or (parsed.scheme != "https" and not (allow_http_local and local))
    ):
        raise ValueError(
            "base URL must be a credential-free HTTPS origin "
            "(or explicit local HTTP)"
        )
    return f"{parsed.scheme}://{parsed.netloc}"


def request_once(url: str, timeout: float) -> dict:
    started = time.perf_counter()
    status = 0
    try:
        request = Request(
            url,
            method="GET",
            headers={"User-Agent": "niuva-readonly-load-probe/1"},
        )
        with urlopen(request, timeout=timeout) as response:
            status = response.status
            response.read()
    except HTTPError as exc:
        status = exc.code
    except (TimeoutError, URLError, OSError):
        status = 0
    return {
        "status": status,
        "latency_ms": (time.perf_counter() - started) * 1000,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a bounded GET-only catalog load probe.",
    )
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--requests", type=int, required=True)
    parser.add_argument("--concurrency", type=int, required=True)
    parser.add_argument("--timeout-seconds", type=float, required=True)
    parser.add_argument("--max-p95-ms", type=float, required=True)
    parser.add_argument("--max-error-rate", type=float, required=True)
    parser.add_argument("--allow-http-local", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.requests < 1 or args.requests > 10_000:
        raise SystemExit("--requests must be between 1 and 10000")
    if args.concurrency < 1 or args.concurrency > min(args.requests, 200):
        raise SystemExit("--concurrency must be between 1 and min(requests, 200)")
    if args.timeout_seconds <= 0 or args.timeout_seconds > 60:
        raise SystemExit("--timeout-seconds must be greater than 0 and at most 60")
    if args.max_p95_ms <= 0:
        raise SystemExit("--max-p95-ms must be greater than 0")
    if not 0 <= args.max_error_rate <= 1:
        raise SystemExit("--max-error-rate must be between 0 and 1")

    try:
        origin = validate_origin(
            args.base_url,
            allow_http_local=args.allow_http_local,
        )
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc

    target = f"{origin}/api/catalog/products?limit=24"
    started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        results = list(
            executor.map(
                lambda _index: request_once(target, args.timeout_seconds),
                range(args.requests),
            )
        )
    elapsed = time.perf_counter() - started
    latencies = [result["latency_ms"] for result in results]
    errors = sum(
        1 for result in results if result["status"] < 200 or result["status"] >= 300
    )
    error_rate = errors / len(results)
    p95 = percentile(latencies, 95)
    passed = p95 <= args.max_p95_ms and error_rate <= args.max_error_rate
    report = {
        "target_path": "/api/catalog/products?limit=24",
        "requests": len(results),
        "concurrency": args.concurrency,
        "elapsed_seconds": round(elapsed, 3),
        "requests_per_second": round(len(results) / elapsed, 3),
        "latency_ms": {
            "p50": round(percentile(latencies, 50), 3),
            "p95": round(p95, 3),
            "max": round(max(latencies), 3),
        },
        "errors": errors,
        "error_rate": round(error_rate, 6),
        "approved_thresholds": {
            "max_p95_ms": args.max_p95_ms,
            "max_error_rate": args.max_error_rate,
        },
        "passed": passed,
    }
    print(json.dumps(report, sort_keys=True))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
