<#
.SYNOPSIS
    This PowerShell script searches for .log files older than one month within the C:\ProgramData\Qlik\Sense\Log directory
    and prompts the user to move them to a new location.

.DESCRIPTION
    1. The script recursively searches for .log files under C:\ProgramData\Qlik\Sense\Log and filters those last modified more than 30 days ago.
    2. For each filtered file, it displays the file name, size, and location relative to the log folder.
    3. After listing, the script prompts the user if they would like to move these files.
       - The default response is "no" (n).
       - If the user responds with "yes" (y), the script moves each file to a new destination folder under D:\SAFE TO DELETE QLIK LOGS\{current date}\{relative folder path}.
    4. The script retains the original folder structure within the new destination.
    5. Necessary directories in the destination path are created if they do not already exist.

.PARAMETERS
    None. The script relies on pre-defined source and destination paths within the code.

.EXAMPLE
    Run the script in PowerShell to search for old log files and optionally move them.
#>

# Define constants
$SourcePath = "C:\ProgramData\Qlik\Sense\Log"
$DestinationRoot = "D:\SAFE TO DELETE QLIK LOGS"
$DateSuffix = (Get-Date -Format "yyyy-MM-dd")

# Function to find .log files older than a month
function Get-OldLogFiles {
    param (
        [string]$path,
        [int]$daysOld = 30
    )
    # Find all .log files under the specified path and filter by last modified date
    Get-ChildItem -Path $path -Recurse -Filter "*.log" | Where-Object { 
        ($_.LastWriteTime -lt (Get-Date).AddDays(-$daysOld)) 
    }
}

# Function to display log file details
function Display-LogFileInfo {
    param (
        [array]$files
    )
    foreach ($file in $files) {
        # Relative path calculation for clarity in output
        $relativePath = $file.FullName.Substring($SourcePath.Length + 1)
        
        # Display details for each file
        [PSCustomObject]@{
            'File Name' = $file.Name
            'File Size (KB)' = [math]::round($file.Length / 1KB, 2)
            'Location (relative)' = $relativePath
        }
    } | Format-Table -AutoSize
}

# Function to move files if the user confirms
function Move-OldLogFiles {
    param (
        [array]$files,
        [string]$destinationRoot,
        [string]$dateSuffix
    )

    foreach ($file in $files) {
        # Determine relative path and construct destination path
        $relativePath = $file.FullName.Substring($SourcePath.Length + 1)
        $destinationPath = Join-Path -Path $destinationRoot -ChildPath "$dateSuffix\$relativePath"
        
        # Create the destination directory if it does not exist
        $destinationDir = Split-Path -Path $destinationPath -Parent
        if (!(Test-Path -Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force
        }
        
        # Move the file to the destination path
        Move-Item -Path $file.FullName -Destination $destinationPath -Force
    }
}

# Main script execution
Write-Output "Searching for log files older than a month in $SourcePath..."

# Retrieve files and store in a variable
$oldLogFiles = Get-OldLogFiles -path $SourcePath

# Display the file list with details
if ($oldLogFiles.Count -gt 0) {
    Write-Output "Found the following log files last modified more than a month ago:"
    Display-LogFileInfo -files $oldLogFiles

    # Prompt user for action
    $userResponse = Read-Host "Would you like to move these files? (y/n - default: n)"
    if ($userResponse -eq 'y') {
        Write-Output "Moving files..."
        Move-OldLogFiles -files $oldLogFiles -destinationRoot $DestinationRoot -dateSuffix $DateSuffix
        Write-Output "Files moved successfully to $DestinationRoot\$DateSuffix."
    } else {
        Write-Output "No files were moved."
    }
} else {
    Write-Output "No log files older than a month were found."
}
