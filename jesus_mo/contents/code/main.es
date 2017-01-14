/*
 * Copyright (C) 2014 Gene Smith <gds + charter net>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Library General Public License version 2 as
 * published by the Free Software Foundation
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details
 *
 * You should have received a copy of the GNU Library General Public
 * License along with this program; if not, write to the
 * Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 */

const author = "\"Mohammed Jones\"";
const websitePart = "comic/"; 
const firstIdentifier = "body";

const infos = {
        "User-Agent": "Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.6 (like Gecko)",
        "Accept": "text/html, image/jpeg, image/png, text/*, image/*, */*",
        "Accept-Encoding": "functionlate",
        "Accept-Charset": "iso-8859-15, utf-8;q=0.5, *;q=0.5",
        "Accept-Language": "en",
        "Host": "jesusandmo.net",
        "referrer": "http://www.jesusandmo.net/",
        "Connection": "Keep-Alive"
}

/*
 * Note: This site archives strips based on a "string" style identifier
 * so only sequential access is possible to images stored at the site
 * (approximately 1 months worth) or older images if stored in the
 * plasma_engine_comic/ cache directory. Selection by date does not
 * seem to be possible.
 */

function init()
{
    comic.comicAuthor = author;
    comic.firstIdentifier = firstIdentifier;
    comic.websiteUrl = infos.referrer;
    comic.shopUrl = comic.websiteUrl;

    //check if the comic.identifier is empty
    if (comic.identifier != new String())
    {
        // subsequent calls (many times)
        comic.websiteUrl += (websitePart + comic.identifier);
        comic.requestPage(comic.websiteUrl, comic.Page);
    }
    else
    {
        // first call (one time)
        comic.requestPage(comic.websiteUrl, comic.User);
    }
}

/*
 * Note: print() below seems to do nothing so debugging broken. To debug 
 * you can set "data" to the string you want to check the value of and then
 * call invalid function printk() to force an error in konsole running
 * plasmashell, e.g.,:
 *   data = match[1];
 *   printf("anything");
 * Look for data=' in error output. If data not set whole webpage dumps.
 */
function pageRetrieved(id, data)
{
    if (id == comic.User) {
        // obtain identifier for oldest/original strip
        var exp = new RegExp("<td class=\"comic-nav\.*/" + websitePart + "(.*)/\" class=\"comic-nav-base comic-nav-first\""); 
        // e.g., look for string "body" in"
        // <td class="comic-nav"><a href="http://www.jesusandmo.net/comic/body/" class="comic-nav-base comic-nav-first">&lsaquo;&lsaquo; First</a></td>
        var match = exp.exec(data);
        if (match != null) {
            comic.firstIdentifier = match[1];
        } else {
            print("Could not find first identifier.");
            // This is not a big problem. Use hardcoded value already set.
        }

        // find identifier for newest strip
        exp = new RegExp("<img src=.*title="  + "\"(.*)\"");
        // e.g., look for title string (e.g., broke) in img src: 
        // <img src="http://www.jesusandmo.net/wp-content/uploads/2017-01-11.png" alt="broke" title="broke"
        var match = exp.exec(data);
        if (match != null) {
            comic.lastIdentifier = match[1];
            comic.identifier = comic.lastIdentifier;
            comic.websiteUrl += (websitePart + comic.identifier);
            comic.requestPage(comic.websiteUrl, comic.Page, infos);
        } else {
            print("Could not find last identifier.");
            comic.error();
            return;
        }
    }

    // find next and previous identifier and get comic image
    if (id == comic.Page) {
        var exp = new RegExp("<td class=\"comic-nav\".*/" + websitePart + "(.*)/\".*comic-nav-next");
        // e.g., look for "broke" in Next link:
        // <td class="comic-nav"><a href="http://www.jesusandmo.net/comic/broke/" class="comic-nav-base comic-nav-next">Next
        var match = exp.exec(data);
        if (match != null) {
            comic.nextIdentifier = match[1];
        }
        else
        {
            // normal for lastest comic
            print("No next")
        }

        exp = new RegExp("<td class=\"comic-nav\".*/" + websitePart + "(.*)/\".*comic-nav-previous");
        // e.g., look for "share2" in Prev link:
        // <td class="comic-nav"><a href="http://www.jesusandmo.net/comic/share2/" class="comic-nav-base comic-nav-previous">&lsaquo; Prev
        match = exp.exec(data);
        if (match != null) {
            comic.previousIdentifier = match[1];
        }
        else
        {
            // normal for original/first comic
            print("No prev")
        }

        exp = new RegExp("img src=\"(.*\.png)\".*title=\"" + comic.identifier);
        exp = new RegExp("<meta property=\"og:image\" content=\"(.*)\"");
        // e.g., look for url http://... in:
        // <meta property="og:image" content="http://www.jesusandmo.net/wp-content/uploads/2005-11-24.jpg" />
        match = exp.exec(data);
        if (match != null) {
            comic.requestPage(match[1], comic.Image, infos);
        } else {
            //data = comic.identifier;
            print("Could not find comic image.");
            comic.error();
            return;
        }
    }
}
