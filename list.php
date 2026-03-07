<?php

$baseDir = __DIR__;  // restrict to current directory
$files = [];

function scanDirRecursive($dir) {
    global $files, $baseDir;

    foreach (scandir($dir) as $item) {

        // Skip current dir, parent dir, and img folder
        if ($item == '.' || $item == '..' || $item == 'img') continue;

        $fullPath = $dir . '/' . $item;

        if (is_dir($fullPath)) {
            scanDirRecursive($fullPath);
        } else {
            if (pathinfo($fullPath, PATHINFO_EXTENSION) === 'txt') {
                $files[] = str_replace($baseDir . '/', '', $fullPath);
            }
        }
    }
}

scanDirRecursive($baseDir);

header('Content-Type: application/json');
echo json_encode($files);
