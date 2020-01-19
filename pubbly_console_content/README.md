## Console Content

There are four main types of content on pubbly consoles. Mapped exports, stitched exports, variable exports and static exports. Each ZIP file can be downloaded from https://github.com/XPRIZE/GLEXP-Team-CCI/releases

To concatenate the partial files into one ZIP file, execute the following

```
cat MappedExports.zip.part_* > MappedExports.zip
cat StitchedExports.zip.part_* > StitchedExports.zip
cat VariableExports.zip.part_* > VariableExports.zip
```

And extract to a ready pubbly console. Then import the Content.sql file (can be downloaded from https://github.com/XPRIZE/GLEXP-Team-CCI/releases).

Full instructions at pubbly main repo, section "Submission from existing: Xprize console duplication"
