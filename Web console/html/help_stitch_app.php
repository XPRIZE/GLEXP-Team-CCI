<html>
<head>
    <title>Stitch app help</title>
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
            margin-top: 15px;
        }

        div.left {
            width: calc(25% - 2px);
        }

        div.right {
            width: calc(75% - 20px);
        }

        div.left, div.right {
            padding: 5px;
            float: left;
            border: 0px solid RGB(20, 20, 20);
        }

        div.left {
            border-right-width: 2px;
        }

        div.right img {
            max-height: 400px;
            max-width: 100%;
            display: block;
            margin: auto;
            cursor: -webkit-zoom-in;
        }

        div.right img.large {
            cursor: -webkit-zoom-out;
            max-height: 1000px;
        }

        div.middle {
            width: 50%;
            display: block;
            margin: auto;
        }

        ul li, ol li {
            margin: 10px;
            line-height: 23px;
        }

        span.btn {
            background-color: #268fd5;
            border-radius: 5px;
            padding: 2px;
        }

        span.tabHeader {
            background-color: #268fd5;
            border-radius: 5px;
            border-bottom-right-radius: 0px;
            border-bottom-left-radius: 0px;
            padding: 2px;
            white-space: nowrap;
            color: white;
        }
    </style>
    <script src="../includes/jquery.js"></script>
</head>
<body>
<h2>Stitch app help</h2>

<div class="block">
    <div class="left">
        <h3>Make some content</h3>
        <ul>
            <li>Create a series, some children, and/or upload some static books</li>
        </ul>
    </div>
    <div class="right">
        <ul>
            <li><a href="../series/help.php">How to create a series</a></li>
            <li><a href="../books/help.php">How to upload a book</a></li>
        </ul>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Create schools, subjects, levels, units.</h3>
        <ul>
            <li>Select the <span class="btn">Units</span> button from the home page</li>
            <li>Create a new school.</li>
            <li>Select your new school and create a subject.</li>
            <li>Select your new subject and create a level.</li>
            <li>Select your new level and create a unit.</li>
            <li>Schools have subjects have levels have units. If you delete a level, you delete all it's units. Same for
                subjects and schools.
            </li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/stitchApp/Step 2.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Order your units</h3>
        <ul>
            <li>You can drag and drop your mutliple units to reorder them. This will <i>eventually</i> determine the
                order of units presented to the student.
            </li>
            <li>Click the <span class="btn">Order</span> button to save the order.</li>
            <li>Select one of the units from your order and click <span class="btn">Edit</span></li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/stitchApp/Step 3.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Stitch app (overview)</h3>
        <ul>
            <li>Top left is the <span class="tabHeader">Library</span>; All pubbly books available for stitching.
                (Series and static books)
            </li>
            <li>Bottom left is the <span class="tabHeader">Workbench</span>. Add books from the top left to the bottom
                left.
            </li>
            <li>Dead center is the <span class="tabHeader">Workbench Page List</span>. Select a book on the <span
                    class="tabHeader">Workbench</span> and this will populate with the selected book's pages.
            </li>
            <li>Top right is <span class="tabHeader">Unit info</span>. Editable unit properties, like name and bullet
                color. This... actually doesn't work right now, but it will eventually.
            </li>
            <li>Bottom right is the <span class="tabHeader">Unit Page List</span>. Drag pages from the <span
                    class="tabHeader">Workbench Page List</span> to the <span class="tabHeader">Unit Page List</span> to
                create a new unit.
            </li>
        </ul>
    </div>
    <div class="right">
        <img src="../tutorials/stitchApp/Step 4.png"/>
    </div>
</div>


<div class="block">
    <div class="left">
        <h3>Stitch app (steps)</h3>
        <ol>
            <li>Add all relevant pubblys from the <span class="tabHeader">Library</span> to your <span
                    class="tabHeader">Workbench</span>. I've selected
            </li>
            <ul>
                <li>(Series) Fruit->Apples</li>
                <li>(Series) Fruit->Bananas</li>
                <li>(Book) Teaching plurals cover page</li>
            </ul>
            <li>Select a book from your <span class="tabHeader">Workbench</span>, and <span class="tabHeader">Workbench Page List</span>
                will populate with it's pages.
            </li>
            <li>Drag each pages from the <span class="tabHeader">Workbench Page List</span> to the <span
                    class="tabHeader">Unit Page List</span>. You can drag one at a time, or add all pages at once with
                the <span class="btn">Add all -></span> button.</li>
            <li>Once your happy with your Unit, <span class="btn">Save</span>. This will create a new book from the pages specified in the order specified.</li>
            <li>Make sure everything looks good with the <span class="btn">View</span> button.</li>
        </ol>
    </div>
    <div class="right">
        <img src="../tutorials/stitchApp/Step 5.png"/>
    </div>
</div>

<div class="block">
    <div class="left">
        <h3>Complications</h3>
        <p>In the unlikely event that something changes...</p>
        <ul>
            <li>If a unit contains pages from a child, and alterations are made to that child, the unit is out of date.</li>
            <li>Out of date units will have a red "OUTDATED" to the right of the unit name.</li>
            <li>Once selected, the <span class="btn">View</span> button will change to <span class="btn">Update and view</span>. Once clicked it will recreate the Unit.</li>
        </ul>
        <hr>
        <p><b>NOTE: </b>It is possible to change the dimensions of a parent book (through a reupload). It is therefore possible to create a unit of multiple conflicting page dimensions.
            </br></br>Please don't do this :)
            </br></br>I'll give you an error, but there's no way I'm building a whole system just to accommodate what is, basically, a mistake.</p>
    </div>
    <div class="right">
        <img src="../tutorials/stitchApp/Step 6.png"/>
    </div>
</div>

<div class="block">
    <div class="middle">
        <h3>Final points</h3>
        <hr>
        <p>
            It is also possible to delete a series, child, or book referenced in a Unit. If you try to recreate a Unit with pages from books that no longer exist, you'll see a big long scary scripty error. This is a known bug and I will fix it.
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
            $(this).attr("large", "true");
            $(this).removeClass("large");
        } else {
            $(this).addClass("large");
            $(this).attr("large", "false");
        }
    })
</script>













