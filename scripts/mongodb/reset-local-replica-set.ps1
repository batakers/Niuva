[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [switch]$DestroyData
)

if (-not $DestroyData) {
    throw "Reset is destructive. Re-run with -DestroyData and confirm the prompt."
}

$composeFile = Join-Path $PSScriptRoot "..\..\docker-compose.transaction.yml"
$target = "local Docker volume niuva_mongodb_data"
if ($PSCmdlet.ShouldProcess($target, "remove the local MongoDB replica-set volume")) {
    docker compose -f $composeFile down --volumes --remove-orphans
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed to remove the local replica-set volume."
    }
}
