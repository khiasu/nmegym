$path = 'f:\gymwebsite\public\assets\css\style.css'
$lines = Get-Content $path
$lines[588] = '  transition: color 0.2s;' + "`n" + '}'
$lines | Set-Content $path
