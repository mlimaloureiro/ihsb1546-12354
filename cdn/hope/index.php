<?php

include("resize-class.php");

$db = mysql_connect('127.0.0.1', 'hope', 'extintor') or die('Error: ' . mysqli_error($db));
mysql_select_db('hope', $db);

print_r($_POST);

// remove photo
if(isset($_POST['remove_photo']) && isset($_POST['id_photo'])) {
        $idPhoto = $_POST['id_photo'];
        $q = mysql_query("SELECT * FROM hopeapp_photos WHERE id = $idPhoto");
        if(mysql_num_rows($q) > 0) {

                $res = mysql_fetch_assoc($q);
                print_r($res);

                $path_small = "photos/" . $res['path_small'];
                $path_medium = "photos/" . $res['path_medium'];
                $path_big = "photos/" . $res['path_big'];
                echo "<br />";
                echo $path_small;

                unlink($path_small);
                unlink($path_medium);
                unlink($path_big);

                mysql_query("DELETE FROM hopeapp_photos WHERE id = $idPhoto");

                echo "deleted";
        }else{
                return false;
        }
}


if(isset($_POST['id_occurrence'])) {
        $id_occurrence = $_POST['id_occurrence'];
        $allowedExts = array("gif", "jpeg", "jpg", "png","JPG","JPEG","GIF","PNG");
        $temp = explode(".", $_FILES["file"]["name"]);
        $extension = end($temp);

        $occDir = "photos/" . $id_occurrence;
        $uniqName = sha1($_POST['randomFactor'] . $id_occurrence . time());

	echo $occDir;

        if(in_array($extension, $allowedExts))
        {
                $tempDir = 'temp/' . $uniqName. "." . $extension;
                move_uploaded_file($_FILES['file']['tmp_name'], $tempDir);

                // check if occurrence directory exists
                if (!is_dir($occDir))
                {
                        mkdir($occDir, 0777);
                }

                $small = $occDir . "/small_" . $uniqName . "." . $extension;
                $medium = $occDir . "/medium_" . $uniqName . "." . $extension;
                $big = $occDir . "/big_" . $uniqName . "." . $extension;

                $obj = new resize($tempDir);
                $obj->resizeImage(120, 120,'crop');
                $obj->saveImage($small, 100);

                $obj = new resize($tempDir);
                $obj->resizeImage(500, 500);
                $obj->saveImage($medium, 100);

                $obj = new resize($tempDir);
                $obj->resizeImage(1000, 1000);
                $obj->saveImage($big, 100);

                $staticSmall = $id_occurrence ."/small_" . $uniqName . "." . $extension;
                $staticMedium = $id_occurrence ."/medium_" . $uniqName . "." . $extension;
                $staticBig = $id_occurrence ."/big_" . $uniqName . "." . $extension;

                mysql_query("INSERT INTO hopeapp_photos (occurrence_id,path_small,path_medium,path_big) VALUES($id_occurrence,'$staticSmall','$staticMedium','$staticBig')");

                echo "done";
        }

}



