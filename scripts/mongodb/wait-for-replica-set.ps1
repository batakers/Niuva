[CmdletBinding()]
param(
    [ValidateRange(1, 300)]
    [int]$TimeoutSeconds = 60
)

$composeFile = Join-Path $PSScriptRoot "..\..\docker-compose.transaction.yml"
$deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)

while ([DateTimeOffset]::UtcNow -lt $deadline) {
    docker compose -f $composeFile exec -T mongodb mongosh --quiet `
        --host localhost:27017 `
        --eval "quit(db.hello().isWritablePrimary ? 0 : 1)"
    if ($LASTEXITCODE -eq 0) {
        Write-Output "MongoDB replica set rs0 is writable."
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

throw "MongoDB replica set rs0 was not writable within $TimeoutSeconds seconds."
