# SWM Certificate System Test Guide (Windows 11)

## Prerequisites Check
1. **Verify OpenSSL accessibility** (CertificateService already probes XAMPP paths):
   ```powershell
   openssl version
   ```
   If not found, ensure `C:\xampp\apache\bin` or `C:\xampp\php` is in your system PATH.

2. **Confirm backend dependencies**:
   ```powershell
   cd D:\Projet\SWM\backend
   composer install
   ```

3. **Database running**: Ensure MySQL/your DB is running and `.env` is correctly configured.

---

## Step 1: Verify Database Migration
```powershell
cd D:\Projet\SWM\backend
php artisan tinker
```
In tinker:
```php
// Check domain column exists
Schema::hasColumn('certificats', 'domain'); // Should return true

// Check existing records have domain populated
App\Models\Certificat::all(['id', 'domain']); // Existing certs should show domains
exit
```

---

## Step 2: Start Laravel Backend
```powershell
cd D:\Projet\SWM\backend
php artisan serve --port=8000
```
Keep this terminal open.

---

## Step 3: Get Admin Auth Token
Send a POST request to login (use PowerShell `Invoke-RestMethod`):
```powershell
$body = @{
    email = "admin@example.com"  # Replace with your admin email
    password = "password"         # Replace with your admin password
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token  # Save this token for subsequent requests
Write-Host "Token: $token"
```
*If you don't have an admin user, create one first or adjust the `admin` middleware check temporarily.*

---

## Step 4: Test Certificate Creation (Store Endpoint)
First, get a valid `service_id` (list services):
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8000/api/services" -Headers $headers
```

Then create a certificate for `auth.com`:
```powershell
$body = @{
    service_id = 1  # Replace with a valid service ID from above
    domain = "auth.com"
    days = 365
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/certificats" -Method Post -Body $body -ContentType "application/json" -Headers $headers
$response | ConvertTo-Json -Depth 10
```

**Expected Results**:
- HTTP 201 status
- Response includes `"domain": "auth.com"` (no `include_private` needed)
- Files created at:
  ```
  D:\Projet\SWM\backend\storage\certs\auth.com\cert.crt
  D:\Projet\SWM\backend\storage\certs\auth.com\cert.key
  ```

---

## Step 5: Verify Filesystem Export
```powershell
# Check directory exists
Get-ChildItem "D:\Projet\SWM\backend\storage\certs\auth.com"

# Verify cert.crt is valid PEM (starts with ---BEGIN CERTIFICATE---)
Get-Content "D:\Projet\SWM\backend\storage\certs\auth.com\cert.crt" -First 1

# Verify cert.key is decrypted (starts with ---BEGIN PRIVATE KEY---)
Get-Content "D:\Projet\SWM\backend\storage\certs\auth.com\cert.key" -First 1
```

---

## Step 6: Test Certificate Show Endpoint
```powershell
$certId = $response.data.id  # From Step 4 response
Invoke-RestMethod -Uri "http://localhost:8000/api/certificats/$certId" -Headers $headers | ConvertTo-Json -Depth 10
```
**Expected**: Response includes `domain: "auth.com"` and `certificat` (public cert), but no `cle_privee` field.

---

## Step 7: Test Private Key Endpoint (Admin Only)
```powershell
# This downloads the decrypted key
Invoke-RestMethod -Uri "http://localhost:8000/api/certificats/$certId/private-key" -Headers $headers -OutFile "D:\temp\auth_com.key"
Get-Content "D:\temp\auth_com.key" -First 1  # Should show ---BEGIN PRIVATE KEY---
```
**Expected**: 200 status, file downloads with decrypted private key. 403 if non-admin tries.

---

## Step 8: Test Certificate Renewal (Triggers Filesystem Sync)
```powershell
$renewResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/certificats/$certId/renew" -Method Post -Headers $headers
$renewResponse | ConvertTo-Json -Depth 10

# Check files are updated (compare modified timestamps)
Get-ChildItem "D:\Projet\SWM\backend\storage\certs\auth.com" | Select-Object Name, LastWriteTime
```
**Expected**: New expiration date, `cert.crt` and `cert.key` timestamps updated. Check Laravel log for Nginx reload:
```powershell
Get-Content "D:\Projet\SWM\backend\storage\logs\laravel.log" -Tail 10 | Select-String "Nginx reload"
```

---

## Step 9: Test Observer Sync (Manual DB Update)
```powershell
cd D:\Projet\SWM\backend
php artisan tinker
```
```php
$cert = App\Models\Certificat::find($certId);
// Trigger observer by updating certificate content
$cert->certificat = $cert->certificat; // Dummy dirty update
$cert->save(); // Observer should trigger CertificatFilesystemService::writeFilesFor()
exit
```
Check file timestamps again - they should update.

---

## Step 10: Test Nginx Integration
1. **Add domain to Windows hosts** (admin Notepad):
   - Open `C:\Windows\System32\drivers\etc\hosts`
   - Add: `127.0.0.1 auth.com`
   - Save

2. **Configure Nginx** (e.g., `C:\xampp\nginx\conf\nginx.conf`):
   ```nginx
   server {
       listen 443 ssl;
       server_name auth.com;
       ssl_certificate "D:/Projet/SWM/backend/storage/certs/auth.com/cert.crt";
       ssl_certificate_key "D:/Projet/SWM/backend/storage/certs/auth.com/cert.key";
       ssl_protocols TLSv1.2 TLSv1.3;
       root "D:/Projet/SWM/backend/public";
       index index.php;
       location / { try_files $uri $uri/ /index.php?$query_string; }
       location ~ \.php$ {
           fastcgi_pass localhost:9000; # Or your PHP-FPM port
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }
   }
   ```

3. **Reload Nginx**:
   ```powershell
   cd C:\xampp\nginx
   .\nginx.exe -s reload
   ```

4. **Test HTTPS**:
   Visit `https://auth.com` in your browser (accept the self-signed cert warning). It should load your Laravel app.

---

## Step 11: Test Certificate Deletion
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/certificats/$certId" -Method Delete -Headers $headers
```
**Expected**: 200 status, `storage/certs/auth.com` directory deleted.

---

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Certificate generation fails | Check `storage/logs/laravel.log` for OpenSSL errors; verify OpenSSL paths in `CertificateService` |
| Files not written | Ensure `storage/certs` is writable: `icacls "D:\Projet\SWM\backend\storage\certs" /grant Users:F` |
| Nginx reload not working | Check paths in `CertificatFilesystemService::reloadNginx()`; manually run `nginx -s reload` |
| Private key endpoint 403 | Ensure user has `role: "admin"` in `users` table |
| Observer not triggering | Check `AppServiceProvider` has the observer registered; clear cache: `php artisan cache:clear` |
