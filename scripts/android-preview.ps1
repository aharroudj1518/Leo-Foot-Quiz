param(
  [switch]$AcceptSdkLicense,
  [string]$Apk
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$runtimeRoot = Join-Path $projectRoot '.expo/android-runtime'
$sdkRoot = Join-Path $runtimeRoot 'android-sdk'
$javaRoot = Get-ChildItem (Join-Path $runtimeRoot 'java') -Directory | Select-Object -First 1
if (!$javaRoot) { throw 'Portable Java runtime is missing. See docs/VISUAL-REDESIGN.md.' }
$env:JAVA_HOME = $javaRoot.FullName
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_USER_HOME = Join-Path $runtimeRoot 'android-user'
$env:ANDROID_AVD_HOME = Join-Path $runtimeRoot 'avd'
$env:ANDROID_EMULATOR_HOME = $env:ANDROID_USER_HOME
New-Item -ItemType Directory -Force $env:ANDROID_USER_HOME,$env:ANDROID_AVD_HOME | Out-Null
$toolsRoot = Join-Path $sdkRoot 'cmdline-tools/latest'
if (!(Test-Path (Join-Path $toolsRoot 'bin/sdkmanager.bat'))) {
  New-Item -ItemType Directory -Force $toolsRoot | Out-Null
  Get-ChildItem (Join-Path $runtimeRoot 'sdk/cmdline-tools') | Copy-Item -Destination $toolsRoot -Recurse
}
$adb = Join-Path $sdkRoot 'platform-tools/adb.exe'
$emulator = Join-Path $sdkRoot 'emulator/emulator.exe'
$systemImage = Join-Path $sdkRoot 'system-images/android-36/google_apis/x86_64/system.img'
if (!(Test-Path $adb) -or !(Test-Path $emulator) -or !(Test-Path $systemImage)) {
  if (!$AcceptSdkLicense) { throw 'SDK licence acceptance is required. Run with -AcceptSdkLicense only after the user approves the Google Android SDK licence.' }
  @('y','y','y') | & (Join-Path $toolsRoot 'bin/sdkmanager.bat') --sdk_root=$sdkRoot 'platform-tools' 'emulator' 'system-images;android-36;google_apis;x86_64'
  if ($LASTEXITCODE -ne 0 -or !(Test-Path $systemImage)) { throw 'Android package installation did not complete.' }
}
if (!(Test-Path (Join-Path $env:ANDROID_AVD_HOME 'LeoqoVisualPreview.ini'))) {
  'no' | & (Join-Path $toolsRoot 'bin/avdmanager.bat') create avd --name LeoqoVisualPreview --package 'system-images;android-36;google_apis;x86_64' --device pixel_6
  if ($LASTEXITCODE -ne 0) { throw 'Android virtual device creation failed.' }
}
& $emulator -accel-check
if ($LASTEXITCODE -ne 0) { throw 'Android hardware acceleration is unavailable. Do not change Windows security or hypervisor settings automatically.' }
& $adb start-server
$device = 'emulator-5580'
$running = & $adb devices
if (!($running -match $device)) {
  # The user requested a visible simulator, so show this application window.
  Start-Process -FilePath $emulator -ArgumentList @('-avd','LeoqoVisualPreview','-port','5580','-no-snapshot','-gpu','swiftshader','-memory','2048') -WindowStyle Normal
}
$ready = $false
for ($attempt = 0; $attempt -lt 90; $attempt++) {
  $boot = & $adb -s $device shell getprop sys.boot_completed 2>$null
  if ($boot -eq '1') { $ready = $true; break }
  Start-Sleep -Seconds 2
}
if (!$ready) { throw 'Emulator did not boot within three minutes. Inspect the existing emulator; do not spawn duplicate instances.' }
if ($Apk) {
  $apkPath = (Resolve-Path -LiteralPath $Apk).Path
  & $adb -s $device install -r $apkPath
  if ($LASTEXITCODE -ne 0) { throw 'APK installation failed.' }
  & $adb -s $device shell am start -n com.leoqo.footballquiz/.MainActivity
  if ($LASTEXITCODE -ne 0) { throw 'App launch failed.' }
}
Write-Output 'Leoqo Android preview is open. This is a dedicated local virtual device.'
