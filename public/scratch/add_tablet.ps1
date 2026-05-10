$path = 'f:\gymwebsite\public\assets\css\style.css'
$content = Get-Content $path -Raw
$new_content = $content -replace 'section\{padding:90px 20px;\}', "section{padding:90px 20px;}`r`n@media (max-width: 1024px) { section { padding: 80px 32px; } }"
$new_content | Set-Content $path
