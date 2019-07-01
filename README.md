# DBIOSD
DBD (Dell BIOS Downloader) is a command line tool for downloading the latest BIOS files for Dell computers

## Usage
To use this tool you must create a file ('models.csv') in the root directory.
This file specifies the names of the computer models you want to download BIOS files for.
The names need to be written exactly how they are listed on https://downloads.dell.com/published/Pages/index.html.
For example, if you want the BIOS for the OptiPlex 7050 it needs to spelled *exactly* like that.
For models that have combined BIOSes (i.e. "Latitude 5280/5288") the entry in the file should be exactly that.

Example 'models.csv':
```
Latitude 3450
Latitude E5430
Latitude E5450/5450
Latitude E5540
Latitude E5550/5550
Latitude E5570
Latitude E6430s
OptiPlex 9020
OptiPlex 9030 All In One
```

## Plans
- Add more robust error checking. Currently very basic errors
- Program logs to a file instead of stdout/stderror
- Specify the input/output of the program
- Strcture check the input file (make sure one entry per line)
