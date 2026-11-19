param(
  [Parameter(Mandatory=$true)][string]$SourceRoot,
  [Parameter(Mandatory=$true)][string]$OutputFile
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$workbook = Get-ChildItem -LiteralPath $SourceRoot -Recurse -File -Filter 'WebData_PL_EN.xlsx' | Select-Object -First 1
if (-not $workbook) { throw 'Could not find the RENNSTEIG WebData_PL_EN.xlsx catalogue.' }
$zip = [System.IO.Compression.ZipFile]::OpenRead($workbook.FullName)
try {
  $strings = @()
  $entry = $zip.GetEntry('xl/sharedStrings.xml')
  if ($entry) {
    $reader = [IO.StreamReader]::new($entry.Open())
    try { [xml]$sharedXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $strings = @($sharedXml.sst.si | ForEach-Object { $_.InnerText })
  }

  $entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
  $reader = [IO.StreamReader]::new($entry.Open())
  try { [xml]$sheetXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $ns = [Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
  $ns.AddNamespace('m','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $rows = @($sheetXml.SelectNodes('//m:sheetData/m:row',$ns))
  $headerCells = @($rows[0].SelectNodes('./m:c',$ns))
  $headers = @($headerCells | ForEach-Object {
    $cell = $_; $value = $cell.SelectSingleNode('./m:v',$ns)
    if ($cell.t -eq 'inlineStr') { $cell.SelectSingleNode('./m:is',$ns).InnerText }
    elseif ($value -and $cell.t -eq 's') { $strings[[int]$value.InnerText] }
    elseif ($value) { $value.InnerText } else { '' }
  })
  $records = [Collections.Generic.List[object]]::new()
  foreach ($row in ($rows | Select-Object -Skip 1)) {
    $record = [ordered]@{}
    foreach ($cell in $row.SelectNodes('./m:c',$ns)) {
      if ($cell.r -notmatch '^([A-Z]+)') { continue }
      $letters = $Matches[1]; $column = 0
      foreach ($letter in $letters.ToCharArray()) { $column = $column * 26 + ([int]$letter - [int][char]'A' + 1) }
      $index = $column - 1
      if ($index -ge $headers.Count) { continue }
      $value = $cell.SelectSingleNode('./m:v',$ns)
      if ($cell.t -eq 'inlineStr') { $text = $cell.SelectSingleNode('./m:is',$ns).InnerText }
      elseif ($value -and $cell.t -eq 's') { $text = $strings[[int]$value.InnerText] }
      elseif ($value) { $text = $value.InnerText } else { $text = '' }
      $record[$headers[$index]] = $text
    }
    if ($record['Article Number'] -and $record['Article designation']) { $records.Add($record) }
  }
  $json = ConvertTo-Json -InputObject @($records) -Depth 8
  $parent = Split-Path -Parent $OutputFile
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  [IO.File]::WriteAllText($OutputFile,$json,[Text.UTF8Encoding]::new($false))
} finally { $zip.Dispose() }
