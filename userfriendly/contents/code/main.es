/*
 *   Copyright (C) 2007 Tobias Koenig <tokoe@kde.org>
 *   Copyright (C) 2010 Matthias Fuchs <mat69@gmx.net>
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU Library General Public License version 2 as
 *   published by the Free Software Foundation
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details
 *
 *   You should have received a copy of the GNU Library General Public
 *   License along with this program; if not, write to the
 *   Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

function init()
{
    comic.comicAuthor = "J.D. \"Illiad \" Frazer";
    comic.firstIdentifier = "1997-11-17";
    comic.websiteUrl = "http://ars.userfriendly.org/cartoons/";
    comic.shopUrl = "http://www.computergear.com/computergear-user-friendly-official-swag-site.html";
    var infos = {
        "User-Agent":      "Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.6 (like Gecko)",
        "Accept":          "text/html, image/jpeg, image/png, text/*, image/*, */*",
        "Accept-Encoding": "deflate",
        "Accept-Charset":  "iso-8859-15, utf-8;q=0.5, *;q=0.5",
        "Accept-Language": "en",
        "Host":            "ars.userfriendly.org",
        "Referer":         "http://ars.userfriendly.org/cartoons/?id=" +
                            comic.identifier.addDays(-1).toString("yyyyMMdd"),
        "Connection":      "Keep-Alive"
    }
    print(comic.websiteUrl);

    //if today is selected find the most current strip on the website (might also be yesterday)
    if (comic.identifier.toString() == date.currentDate().toString()) {
        comic.requestPage(comic.websiteUrl, comic.User, infos);
    } else {
        comic.websiteUrl += "?id=" + comic.identifier.toString("yyyyMMdd");
        comic.requestPage(comic.websiteUrl, comic.Page, infos);
    }
}

function pageRetrieved(id, data)
{
    //check which comic is the most recent and adapt the lastIdentifier and websiteUrl
    if (id == comic.User) {
        var re = new RegExp("value=\"(\\d{8})\"");
        var match = re.exec(data);
        if (match != null) {
            comic.lastIdentifier = date.fromString(match[1], "yyyyMMdd");
            comic.websiteUrl += "?id=" + comic.identifier.toString("yyyyMMdd");
        } else {
            comic.error();
            return;
        }
    }

    if ((id == comic.Page) || (id == comic.User)) {
        var re = new RegExp("<img border=\"0\" src=\"http://www.userfriendly.org/cartoons/archives/([^\"]*)\"");
        var match = re.exec(data);
        var url;
        if (match != null) {
            url = "http://ars.userfriendly.org/cartoons/archives/" + match[1];
        } else {
            comic.error();
            return;
        }
        comic.requestPage(url, comic.Image);
    } else if (id == comic.Image) {
        if (comic.apiVersion >= 4600) {
            var count = data.imageCount();
            if (count > 0) {
                var image;
                for (i = 0; i < count; i++) {
                    image = data.read();
                }
                data.image = image;
            }
        }
    }
}
