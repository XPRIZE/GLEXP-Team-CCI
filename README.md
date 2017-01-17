# GLEXP-Team-CCI

Pubbly: A Rapid Production System of Publishing Engaging, Interactive, Educational Materials

The pubbly system consists of three main projects. The Desktop design tools, the Web console, and the Cordova school house application.


DESIGN TOOLS

The Desktop design tools are a cross platform suite of tools written in livecode for non-developers to create interactive books. The creation of discrete content assets, such as books, lessons or games, begins with adding a visual content layer by importing PDF’s and other image files and by adding text fields as needed.

These assets are completed by adding the interactive layer. This is the behind-the-scenes creativity where instructional designers will spend most of their time. In most cases, designers begin this work by tracing areas on each page to create hotspots or ”links,” and then adding ”targets” to them. When triggered (touched or clicked by the student), the targets provide an engaging educational experience. Some examples of targets include playing audio files, flashing images, highlighting text, automated drawing, and running animations.

It is through this system of links, triggers, and targets that Pubbly designers create rich and engaging interactivity. For the newcomer, even the addition of just a few audio targets can produce valuable interactive learning experiences, and designers can upload or “publish” any content asset to the cloud directly from the authoring system. Doing so generates a URL that can be accessed by Internet-connected learners anywhere in the world. Nothing more is required. For GLEXP, we also developed the capability to run content assets locally, without an Internet connection and to arrange those assets into specific learning pathways. For those who want to go further, Pubbly offers much, much more while never requiring any coding or complex computer skills.

Build instructions for the standalone are inside the "Desktop design tools" subfolder"

____


WEB CONSOLE

The Console is a web app that facilitates a number of fundamental tasks directly related to our work on GLEXP. First, the Console enables users to create “virtual schools” with content. In other words, it is the Console that enables designers to organize Pubbly content assets into a coherent sequence of lessons or activities based upon subject area or instructional level. In this way, self-directed learners can benefit from a highly structured approach without the need for a teacher or a physical school. We also have used the term “Virtual School” to describe this structured arrangement, even though the “school” has no teachers, staff, or physical space.

The second critical function of the Console relates to enabling interactive content assets, or “Pubblies,” to be quickly updated, repurposed and leveraged for use in any language (or to make other changes to the assets) without the need to build entirely new Pubblies from scratch. This is really a key to scalability given that in traditional interactive authoring, video, and animation tools, there is a often a lengthy rendering process that makes large scale production and modification very time-consuming. 

We overcame this challenge by developing a template generation system that allows images, animations and audio files to be quickly updated or replaced via a drag-and-drop user interface and published in real time. Internally, we refer to this process as creating a “parent” (or master) and then swapping out specific images or text to create any number of “children,” which are essentially derivative copies of the parent that contain one or more modifications.

The Pubbly parent’s structure and interactivity (the bulk of the designer’s work) is reused as the base of any number of child Pubblies, while images and audio assets are swapped to present new material. Changes made to the parent are passed to all its children, greatly facilitating the editorial process.

Finally, units are then created using the console’s stitch app to combine pages from any child Pubbly. Units are organized by level, subject, and “school.” Upon entering a virtual school, a student selects a subject, a level, and a unit. Levels also have associated games, created through the same development process as units. Games are unlocked by progressing through levels.

They serve as a reward, an incentive, and a way for academic designers to teach through non-traditional methods. Once completed, a virtual school can be downloaded, tested and deployed on mobile devices through an APK installer or other processes.

Build instructions can be found in the Web console subfolder.

____


CORDOVA SCHOOL HOUSE APP



