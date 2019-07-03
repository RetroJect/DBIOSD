# DBIOSD
DBIOSD (Dell BIOS Downloader) is a command line tool for downloading the latest BIOS files for Dell computers

## Usage
To use this tool you must create a file ('models.csv') in the root directory or specify the input file to be used as the first command line argument.
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
| Feature                        | Implemented? | Version Implemented |
| ------------------------------ | ------------ | ------------------- |
| Better Error Checking          | Yes          | V1.0.1              |
| Robust Logging                 | Yes          | V1.0.1              |
| Specify Input File Name        | Yes          | V1.0.2              |
| Computer Name Closest Matching | No           | N/A                 |

## Changelog
Click the triangles to show the changes for that version.
<details open>
  <summary>Version 1</summary>

  <!-- Start Version 1 -->
  <blockquote>

  <!-- Start Version 1.0.2 -->
  <details>
    <summary>Version 1.0.2</summary>
    <blockquote>
      <ul>
        <li>Slight version bump</li>
        <li>Added the ability to specify the input file from the command line</li>
        <ul>
          <li>The first argument will always be taken to be the input file</li>
        </ul>
        <li>Added a <strike>bit of <i>spice</i></strike> few updates to the readme
        <ul>
          <li>Added this changelog
          <li>Changed the 'Plans' section to a better looking table
        </ul>
      </ul>
    </blockquote>
  </details>
  <!-- End Version 1.0.2 -->

  <!-- Start Version 1.0.1 -->
  <details>
    <summary>Version 1.0.1</summary>
    <blockquote>
      <ul>
        <li>Slight version bump</li>
        <li>Added Winston Logging package</li>
        <li>Changed program logging to 'error.log' and 'combined.log'</li>
        <li>Added more entries to .gitignore such as the 'Build' and 'BIOS' Directories</li>
        <li>Fixed spelling errors in 'README.md'</li>
      </ul>
    </blockquote>
  </details>
  <!-- End Version 1.0.1 -->

  <!-- Start Version 1.0.0 -->
  <details>
    <summary>Version 1.0.0</summary>
    <blockquote>
      <ul>
        <li>Created the repository</li>
        <li>Uploaded all origional files</li>
      </ul>
    </blockquote>
  </details>
  <!-- End Version 1.0.0 -->

  </blockquote>
  <!-- End Version 1 -->
</details>