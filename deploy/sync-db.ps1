# ==============================================================================
# ShopStack - Real-Time Database Sync between AWS Cloud & Local PostgreSQL
# ==============================================================================
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("cloud-to-local", "local-to-cloud")]
    [string]$Direction = "cloud-to-local",

    [Parameter(Mandatory=$false)]
    [string]$LocalPass = "Anirban@069"
)

$EC2_IP = "13.48.47.35"
$EC2_USER = "ubuntu"
$KEY_PATH = "deploy/ec2_key.pem"
$DUMP_FILE = "deploy/cloud_data_sync.sql"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ShopStack Database Synchronization Tool" -ForegroundColor Cyan
Write-Host "Mode: $Direction" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if ($Direction -eq "cloud-to-local") {
    Write-Host "[1/3] Generating clean database dump on AWS EC2 ($EC2_IP)..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "sudo docker exec shopstack-db pg_dump -U postgres -d shopstack_db --clean --if-exists > /tmp/cloud_dump.sql"

    Write-Host "[2/3] Downloading database dump via SCP..." -ForegroundColor Yellow
    scp -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP):/tmp/cloud_dump.sql" $DUMP_FILE
    ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "rm -f /tmp/cloud_dump.sql"

    if (Test-Path $DUMP_FILE) {
        $fileSize = (Get-Item $DUMP_FILE).Length
        Write-Host "Dump file received ($fileSize bytes)." -ForegroundColor Green
        Write-Host "[3/3] Restoring cloud database into local PostgreSQL (shopstack_db)..." -ForegroundColor Yellow

        $env:PGPASSWORD = $LocalPass
        psql -U postgres -h localhost -d shopstack_db -f $DUMP_FILE

        Write-Host "==========================================================" -ForegroundColor Cyan
        Write-Host "DATABASE SYNC COMPLETE! Local PostgreSQL now contains all AWS Cloud users and data." -ForegroundColor Green
        Write-Host "==========================================================" -ForegroundColor Cyan
    } else {
        Write-Host "Error: Could not download cloud database dump." -ForegroundColor Red
    }
} else {
    Write-Host "[1/3] Generating clean dump of local PostgreSQL database..." -ForegroundColor Yellow
    $env:PGPASSWORD = $LocalPass
    pg_dump -U postgres -h localhost -d shopstack_db --clean --if-exists -f $DUMP_FILE

    Write-Host "[2/3] Uploading dump to AWS EC2 ($EC2_IP)..." -ForegroundColor Yellow
    scp -o StrictHostKeyChecking=no -i $KEY_PATH $DUMP_FILE "$($EC2_USER)@$($EC2_IP):/tmp/local_dump.sql"

    Write-Host "[3/3] Restoring into EC2 PostgreSQL database..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "sudo docker exec -i shopstack-db psql -U postgres -d shopstack_db < /tmp/local_dump.sql && rm -f /tmp/local_dump.sql"

    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "DATABASE SYNC COMPLETE! AWS Cloud PostgreSQL now matches Local database." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
}
