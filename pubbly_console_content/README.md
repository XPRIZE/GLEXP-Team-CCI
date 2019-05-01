## Console Content

There are four main types of content on pubbly consoles. Mapped exports, stitched exports, variable exports and static exports. Each section is represented here as a split zip file, in order to get under the 100M github file size limit.

To concatenate, execute the following

> cat MappedExports.zip.part* > MappedExports.zip
> cat StitchedExports.zip.part* > StitchedExports.zip
> cat VariableExports.zip.part* > VariableExports.zip
> cat StaticExports.zip.part* > StaticExports.zip

And extract to a ready pubbly console. Then import the Content.sql file.

Full instructions at pubbly main repo, section "Submission from existing: Xprize console duplication"
