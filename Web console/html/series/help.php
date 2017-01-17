<html>
<head>
    <title>Web swap help</title>
    <style>
        h1, h2, h3, h4 {
            width: 100%;
            text-align: center;
        }

        div.block {
            float: left;
            width: 100%;
            border: 0px solid black;
            border-top-width: 2px;
            margin-top:15px;
        }

        div.left {
            width: calc(25% - 2px);
        }

        div.right {
            width: calc(75% - 20px);
        }

        div.left, div.right {
            padding:5px;
            float: left;
            border: 0px solid RGB(20, 20, 20);
        }

        div.left {
            border-right-width: 2px;
        }

        div.right img {
            max-height: 400px;
            max-width:100%;
            display: block;
            margin: auto;
            cursor: -webkit-zoom-in;
        }

        div.right img.large {
            cursor: -webkit-zoom-out;
            max-height: 1000px;
        }

        div.middle {
            width:50%;
            display:block;
            margin:auto;
        }

        ul li, ol li {
            margin:10px;
        }

        span.btn {
            background-color:#268fd5;
            border-radius:5px;
            padding:2px;
        }
    </style>
    <script src="../includes/jquery.js"></script>
</head>
<body>
<h2>Web Swap help</h2>

<div class="block">
    <div class="left">
        <h3>Create a parent book</h3>
        <ul>
            <li>Create a new book in pubbly</li>
            <li>(File -> Asset Manager) Set all assets as fixed (unchaged between child books) or variable (different
                between books)
            </li>
            <li>(File -> Save parent) Save your parent book. You should see a zip file on your Desktop</li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 1.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Create a series</h3>
        <ul>
            <li>Go to the swap app in a browser (http://52.21.126.241/)</li>
            <li>Register and log in</li>
            <li>Select the <span class="btn">Series</span> button from the home page</li>
            <li>Select the <span class="btn">New Series</span> tab</li>
            <li>Enter a name for your series</li>
            <li>Drag and Drop your zip file (step 1) to the dropzone.</li>
            <li>Click the <span class="btn">Start swapping</span> button.</li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 2.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Make some children</h3>
        <p>You should now be at the Swap App. The left panel is the Parent book assets, the right panel is the Child book assets. The right panel should be empty as your new series does not yet have children.</p>
        <hr>
        <ul>
            <li>Create a new child with the <span class="btn">New</span> button under the "No children" column.</li>
            <li>Enter the name of your first child book.</li>
        </ul>
        <p><b>NOTE: </b>The first child book is the first visible in the series. If you built the parent book with first child assets, the first child is a duplicate of the parent.</p>
        <p>For example, in a series about fruit, the first child book should be "Apples". Even if the parent book is built with pictures of apples.</p>
        <ul>
            <li>Create all child books (Apples, Bananas, Cucumbers...)</li>
            <li>You should now see all child books at the top.</li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 3.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Start swapping</h3>
        <ol>
            <li>Select a child book at the top.</li>
            <li>Drag and drop the corresponding assets in the white space to the right of the "notes" field.</li>
            <li>You should see the preview change.</li>
            <li>For audio files, you can hear both the parent and child assets by clicking the blue button in the second column.</li>
            <li>If you do not have a specific asset, you can enter what it should be in the "placeholder" text area</li>
            <li>Any other asset specific information can be entered in the "note" text area.</li>
        </ol>
        <hr>
        <p><b>NOTE: </b>Images can only be png and jpeg files. Audios can only be mp3 or wav.</p>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 4.png"/>
    </div>
</div>


<div class="block">
    <div class="left">
        <h3>Debug your child</h3>
        <ul>
            <li>Select <span class="btn">View</span> in the top right of the child toolbar.</li>
            <li>View your child book. Check that...</li>
        </ul>
        <ol>
            <li>The name of the book is correct. If not, rename from the Swap App.</li>
            <li>All swapped images have come in correctly.</li>
            <li>All audio files play correctly. All timed events work well.</li>
        </ol>
        <hr>
        <p><b>NOTE: </b>Swapped images will resize (without distorting) to the dimensions of the parent image.
        <br><br>If a 100X100 parent image is swapped with a 50X50 child image, the child image will resize to 100X100 with no margins.
        <br><br>If a 100X100 parent image is swapped with a 50X25 child image, the child image will resize to 100X50 with a 25px horizontal margin.
        <br><br>If a 100X100 parent image is swapped with a 200X250 child image, the child image will resize to 80X100 with a 10px vertical margin.
        <br><br>Swapped images will be centered within the bounding rectangle of the parent dimensions.
        </p>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 5.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Reupload your parent</h3>
        <hr>
        <p>In the <i>unlikely event</i> that you need to make changes to your parent book...</p>
        <ul>
            <li>Make all nessisary changes to the parent book.</li>
            <li>Redefine fixed and variable assets if need be (File -> Asset manager)</li>
            <li>Save as parent (File -> Save as parent ... Zip on desktop)</li>
            <li>Select the series in the pubbly console (Home -> Series Select -> Edit series tab -> Click on "Fruit").</li>
            <li>Click on "Reupload parent" in the "Actions" tab.</li>
            <li>Drag your new parent zip file to the drop zone.</li>
            <li>All previously made and currently applicable swaps will be carried over (notice the banana is still there)</li>
            <li>All changes made to the parent will flow to the children (notice the text has changed from "plural" to "Many")</li>
        </ul>
        <p><b>NOTE: </b>If you delete a variable asset from the parent book, then reupload, any swaps made on that asset will no longer exist.
        <br><br>If you accidentally delete variable assets throughout the series, you can re-upload a previous version of the parent book with those variable assets, and the changes will reappear.
        <br><br>If something really really bad happens, and you just lost a month of work, call Jason. I may be able to roll back your changes to a specific date.</p>
    </div>
    <div class="right">
        <img src="../tutorials/webswap/Step 6.png"/>
    </div>
</div>

<div class="block">
    <div class="middle">
        <h3>Final points</h3>
        <hr>
        <p>
            You may need multiple parent books for one series.
            For instance, if there are two drop zones on one lesson, but three drop zones on another,
            you may need two separate parent books to handle the difference.
            If, however, one lesson has a suffix and the other has none, you can get around this difference by swapping
            a blank image for the suffix.
        </p>
        <hr>
        <p>
            Text areas in a pubbly book do not have a fixed font size. The text will increase in size to the maximum
            possible within the confines of the field dimensions.
        </p>
    </div>
</div>

<!-- Extra scroll space for all the weird people who like to read in the center of a window -->
<div style="height:300px;width:100%;float:left;"></div>
</body>
</html>

<script>
    $(".right img").click(function () {
        if ($(this).attr("large") == "false") {
            $(this).attr("large","true");
            $(this).removeClass("large");
        } else {
            $(this).addClass("large");
            $(this).attr("large","false");
        }
    })
</script>













