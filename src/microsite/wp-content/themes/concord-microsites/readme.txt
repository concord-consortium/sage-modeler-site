=== Concord Micro-sites ===

Requires at least: 4.0
Tested up to: 4.8
Stable tag: 1.0.0

Concord Micro-sites Theme

== Description ==

This is the Concord Micro-sites website redesign. It was developed with mostly static html, css, and javascript.

In the php template file, each module is noted and separated by comments. Please use a module as a whole for the proper styling. Each element's
contents can be edited, and in some cases, duplicated (additional slides in the slider, or addition accordion items, for example) and these are
noted in the comments for each module. If a javascript file is required, it will be noted in the comment for the module.

Main Template(s):

File name: static-microsite-homepage.php
Template Name: Module Reference
Description: This template contains all the designed modules with example images and mocked-up text.

CSS/SASS:

Most of our module-specific CSS/SASS stylings can be found in themes/concord-microsites/sass/modules/ for each of the body modules.
Header and footers stylings are found in themes/concord-microsites/sass/layout/.
Custom color variables are found in themes/concord-microsites/sass/variables/_colors.scss.


== Installation ==

1. In your admin panel, go to Appearance > Themes and click the Add New button.
2. Click Upload and Choose File, then select Concord-microsites theme's .zip file. Click Install Now.
3. Click Activate.
4. Add a new page and select the "Module Reference" template to see all the modules available.
5. Other page templates contain examples of how the modules can be used.

== Frequently Asked Questions ==

= Does this theme support any plugins? =

It is strongly recommended that the wp-scss plugin is used so that the stylesheets can be easily managed. If you are using scss, you might need to create a symlink
from theme/concord-microsites/css/style.css to theme/concord-microsites/style.css because this was the way wp-scss is set up. Latest versions of wp-scss can write directly to the theme's css file.

= How do I set up additional themes for other micro-sites? =

1. Repeat steps above to load this theme.
2. Set up wp-scss.
3. Edit the following sass file: themes/concord-microsites/sass/variables/_colors.scss
4. Find the following color variables and update their values for the new theme:
* $col-link
* $col-hover
* $col-headline


== Credits ==

* Based on Underscores http://underscores.me/, (C) 2012-2016 Automattic, Inc., [GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html)
* normalize.css http://necolas.github.io/normalize.css/, (C) 2012-2016 Nicolas Gallagher and Jonathan Neal, [MIT](http://opensource.org/licenses/MIT)