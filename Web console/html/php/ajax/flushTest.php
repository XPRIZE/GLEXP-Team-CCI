<?php
for( $i = 0 ; $i < 3 ; $i++ )
{
    echo "update $i</br>";
    flush();
    ob_flush();
    sleep(1);
}
echo "done</br>";