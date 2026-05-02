Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Security

$apkPath = Resolve-Path ".\planera-installed.apk"
Write-Host "APK: $apkPath"

$zip = [System.IO.Compression.ZipFile]::OpenRead($apkPath)
try {
    $entries = $zip.Entries | Where-Object { $_.FullName -match "META-INF/.*\.(RSA|DSA|EC)$" }
    if (-not $entries) {
        Write-Host "No signature entry found in META-INF"
        return
    }

    foreach ($e in $entries) {
        Write-Host ""
        Write-Host "=== Entry: $($e.FullName) ==="
        $stream = $e.Open()
        $ms = New-Object System.IO.MemoryStream
        $stream.CopyTo($ms)
        $bytes = $ms.ToArray()
        $stream.Close()
        $ms.Close()

        $signedCms = New-Object System.Security.Cryptography.Pkcs.SignedCms
        $signedCms.Decode($bytes)

        foreach ($c in $signedCms.Certificates) {
            $sha1 = ($c.Thumbprint -split "(..)" | Where-Object { $_ -ne "" }) -join ":"
            $sha256Bytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($c.RawData)
            $sha256 = ($sha256Bytes | ForEach-Object { $_.ToString("X2") }) -join ":"
            Write-Host "Subject: $($c.Subject)"
            Write-Host "SHA-1:   $sha1"
            Write-Host "SHA-256: $sha256"
        }
    }
}
finally {
    $zip.Dispose()
}
