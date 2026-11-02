#!/bin/zsh
# Opens only the static local entrypoint; no installation or network access.
project_dir="${0:A:h}"
/usr/bin/open "$project_dir/index.html"
