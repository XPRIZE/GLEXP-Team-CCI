## Desktop design tools developer build instructions

### How to build standalone

* Download [Livecode Community Edition (free) 7.1.1](http://downloads.livecode.com/livecode/) for your platform.
* Open the enclosed "Pubbly.livecode" from within Livecode Community Edition.
* Click on File and choose Standalone Application Settings.
* Use the buttons at the top of the window to choose your platform (Windows or Mac).
* Check the top left button labeled "Build for" and close this window.
* Click on File and choose "Save as Standalone Application".
* Quit the program.
* Duplicate the enclosed Tools.pbly file to the Pubbly folder now on your desktop.
* Duplicate the enclosed Support folder to the Pubbly folder now on your desktop.
* Double-click the Pubbly application to open and test your build.


Pubbly's design tools, the file named “Tools”, is written entirely in Livecode, an object oriented environment which is high level yet still quite powerful.  The code itself in Livecode is a very English-like syntax.  An understanding of this fun and easy-to-learn development environment is needed in order to work with Pubbly's design tools.  The free community edition of Livecode can be downloaded [here](http://downloads.livecode.com/livecode/).

Once you have a basic understanding of Livecode you can modify the tools any way you like.  I suggest you get a basic understanding of Livecode and then get started editing the tools in order to get an idea as to which parts of Livecode you want a further understanding of to move on.  To get started, rename Tools.pbly to Tools.livecode.  The first time you open it it's probably best to open it from within Livecode.  From then on you should be able to double-click it on the desktop.  In Livecode files are called stack files, each one of which can contain one or more “stacks”.  Livecode uses the stack/card metaphor whereby a card is a screen.  No stack can ever display more than one of its cards simultaneously, although you can display several stacks, even if they both belong to the same stack file, simultaneously.

Finally, there is one other stack file, found at [Pubbly Design Tools](https://github.com/PubblyDevelopment/pubbly_design_tools) path "Development/Pubbly.livecode"

This is a very small stack file with just one stack, which in turn contains just one card named Splash.  This is what the Pubbly.exe standalone is built from and it is the screen initially displayed on launch.  It's intentionally kept very simple.  Its main capability is to compare the version inside the Tools stack file with a text file on Pubbly's server and automatically update the Tools stack file, if need be, thus reducing the frequency with which users have to manually re-download the complete installation.

After opening Tools from, Livecode's browse tool can be used to run your code while Livecode's edit tool can be used to open/edit the code behind any object.  Although nearly all objects, including the menus, have code behind them, the majority of the Tools' coding is contained in seven stacks name Library1, Library2, etc.  You'll find it easiest to work on the Tools if you have a project open.  For example, with a project open you can click on Go and see a list of all the stacks inside the Tools stack file.  Choose any of the libraries and a window with that library's code is automatically opened.  Choose any of the other stacks and the stack itself opens.

Another easy way to navigate quickly to any of the handlers found in Pubbly's seven libraries is to type the keyboard shortcut control-E.  This opens a stack named Libraries which lists every command and function in the seven libraries.  Double-click any of them to open the code itself.

In Livecode, cards and stacks are objects just like buttons and fields and, as such, can also contain code.  The stack itself is often where you'll find much of the code that is used to run the tools.  When the tools are launched the code for the first handler which runs, named preOpenStack, is found in the first (and only) card of the tools stack.  The second handler which runs on launch, same location, is named preOpenCard.

An area of Livecode which you'll want an understanding of to work with the tools is Data Grids.  When you see the tools' three different grids; Objects, Links, and Animations, you may think you're looking at three different cards in the Tools stack but you're really just looking at the one (and only) card displaying one grid at a time.  These three Data Grids are one of the main entry points for working with the tools.

It's quite easy to view code as it's executed, line-by-line, to get an understanding as to what's happening behind the scenes.  As an example, I'll provide the following step-by-step instructions you can use to see what actually happens when the end-user choose the first menu choice, New, under the File menu.
* Choose Livecode's edit tool
* Right-click the tools' File menu and choose Edit Script
* Click to the left of of the number 1 for line #1
> This should put a red, debug checkpoint on that line
* Choose Livecode's browse tool
* Click on the tools' File menu and choose New

You can now step through code, one line at a time, by using the icons in the top left corner of the script window.  (You can use the words “code” and “script” interchangeably in Livecode.)  If you want to see what's happening in the currentMode handler found on line 3 then click the Step Into icon.  Otherwise, click the Step Over icon to move on.

Here are a few personal naming conventions regarding the use of variables.  I often preface a variable with “cur” which is short for current, data which will be kept for a while in the handler and then discarded.  The use of “temp” or “tmp” in a variable is data kept for a very short period during the handler's execution.  Global variables are prefaced with the word “the” as in theContents, theLine, theLines, and theNum.  Occasionally I'll preface a variable name with the word “thee” in which case the variable is an array.

A special global variable I use is theCommand.  Livecode's engine does not run its own idle handler while any commands handlers are being executed.  With this in mind, if I want something to happen after a series of handlers has finished executing, I simply load the name of the handler I want to run into the global variable “theCommand”.  Then, when all handlers have finished, Livecode's engine once again runs its “on idle” handler which checks the global, theCommand.  If it's not empty, the name of the loaded command is executed.

It is my sincere wish that you get behind the scenes using Livecode to alter Pubbly's design tools in any way that you wish.  And it's my sincere belief that once you get into it you'll thoroughly enjoy Livecode, Pubbly, and the magic of software development.  If you get stuck on any aspect of Pubbly's Tools please [email me](mailto:RayHorsley@mail.com)and I'll do my best to get back with you in a timely manner.  Best wishes and enjoy coding!

- Ray Horsley