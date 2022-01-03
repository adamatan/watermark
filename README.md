# watermark
Adds a visible watermark to images for personal privacy.

## Usage

```shell
python watermark.py --size 250 license.jpeg 'For Acme Bank 2021-10-20'
```

```
license.jpeg
```

![Bundesrepublik Deutschland, Bundesministerium des Innern, Public domain, via Wikimedia Commons, https://commons.wikimedia.org/wiki/File:DE_Licence_2013_Front.jpg](license.jpeg)

```
watermark_license.jpeg
```

![Based on: Bundesrepublik Deutschland, Bundesministerium des Innern, Public domain, via Wikimedia Commons, https://commons.wikimedia.org/wiki/File:DE_Licence_2013_Front.jpg](watermark_license.jpeg)

## Requirements
* Python 3
* [Imagemagick convert](https://imagemagick.org/script/download.php)
