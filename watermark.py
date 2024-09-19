# -*- coding: utf-8 -*-

"""
A utility script for adding a visible watermark on an image.
Usefult for protecting your privacy when an online service requests
a scanned image as a proof. Add the service name to the image, so
if it leaks - identity thieves will have hard time to use it when
it has a watermark like "For blah agency only - Jan 2, 2021".

Read more here: https://github.com/adamatan/watermark

MIT License

Copyright (c) 2022 Adam Matan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

"""
import os
from os.path import splitext
import subprocess as sp
import argparse

def add_watermark(input_filename, output_filename, text, text_size, rotation_degrees, color_name, opacity: float=0.4):
    """Adds a watermark to a single image and store the results in a new file."""
    command = f"""convert {input_filename} \\
    \\( -size {text_size} -background none -fill {color_name} -gravity center \\
    label:"{text}" -trim -rotate {rotation_degrees} \\
    -bordercolor none -border 10 \\
    -channel A -evaluate multiply {opacity} \\
    -write mpr:wm +delete \\
    +clone -fill mpr:wm  -draw 'color 0,0 reset' \\) \\
    -compose over -composite \\
    {output_filename}
    """
    p=sp.Popen(command, stdout=sp.PIPE, stderr=sp.STDOUT, shell=True)
    stdout, _ = p.communicate()
    if p.returncode == 0:
        return
    else:
        raise ValueError(stdout.decode('utf8'))

def get_args():
    """Parse the CLI args and display a help message if necessary."""
    parser = argparse.ArgumentParser(description='Add watermarks to images')
    parser.add_argument('image', help='The input image')
    parser.add_argument('text', help='The watermark text')
    parser.add_argument('--size', help='Text size', type=int, default=100)
    parser.add_argument('--opacity', help='Text opacity, between 0 and 1', type=float, default=0.4)
    return parser.parse_args()

def add_watermarks(args):
    """Adds two textual watermarks to the input image."""
    input_filename_base, input_filename_extention = splitext(args.image)
    intermedaite_filename = f"intermediate_{input_filename_base}{input_filename_extention}"
    result_extension = '.jpeg'
    result_filename = f"watermark_{input_filename_base}{result_extension}"

    add_watermark(args.image, intermedaite_filename, args.text, args.size, 30, "maroon", args.opacity)
    add_watermark(intermedaite_filename, result_filename, args.text, args.size, -30, "navy", args.opacity)
    os.remove(intermedaite_filename)

if __name__ == "__main__":
    args = get_args()
    add_watermarks(args)
