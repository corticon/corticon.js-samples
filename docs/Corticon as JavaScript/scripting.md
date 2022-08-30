---
description: >-
  You can script continuous integration and continuous delivery (CI/CD) when you
  use the Corticon.js utilities to make changes to software rapidly and
  iteratively
---

# Scripting

You can use the `corticonjs` command line utility with the following options and sub-options:

* Package rules for deployment
* Generate rule reports
* Run rule tests

The utility is bundled with the Corticon JavaScript Studio installation in its `Utilities` directory.

| corticonJS.bat options                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <pre><code>usage: corticonJS
-c,--compile             compile a ruleflow into a decision service
-h,--help                print this message
-r,--report              generate the report for a Corticon asset
-t,--test                execute tests for a set of ruleflows or rulesheets</code></pre> |

| --compile options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <pre><code>usage: compile
-b,--bundle &#x3C;name>     the name of the decision service bundle
-h,--help              print this message
-i,--input &#x3C;file>      ruleflow (.erf file) to compile
-o,--output &#x3C;folder>   folder to place the decision service Javascript bundle in
-p,--platform &#x3C;target platform> target platform (Azure, Browser, Google, Lambda, 
					Node, Progress Kinvey)	
-t,--top &#x3C;entities>   space separated list of entity names 
					that are expected at the root of the payload</code></pre> |

| --report options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <pre><code>usage: report
-c,--css &#x3C;CSS file>         CSS file to use in report
-h,--help                   print this message
-i,--input &#x3C;file>           Corticon asset (.ecore, .ers, .erf, .ert) to report
-if,--image &#x3C;image folder>  image folder to copy to output folder
-o,--output &#x3C;folder>        folder to place the report files in
-p,--project &#x3C;project name> Corticon project name to use in report
-x,--xslt &#x3C;XSLT file>       XSLT file to use in report</code></pre> |

The files for generating reports are in your Corticon Work directory's `Reports` folder.

| --test options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <pre><code>usage: test
-a,--all                          run all test sheets in the ruletest
-dj,--dependentjs &#x3C;dependentJS>   comma separated list of dependent javascript files
-h,--help                         print this message
-i,--input &#x3C;file>                 comma separated list of input (.ert) files to run, 
                                         wildcards allowed
-o,--output &#x3C;file>                file to contain output of test run
-s,--sheet &#x3C;Sheet names>          comma separated list of test sheets to run</code></pre> |

Note: The `test` option requires a valid JavaScript enabled license file (`CcLicense.jar`) in the `Utilities/lib` folder.
