/*
 *   Copyright (C) 2007 Tobias Koenig <tokoe@kde.org>
 *   Copyright (C) 2010 Matthias Fuchs <mat69@gmx.net>
 *   Copyright (C) 2015 Cameron Gray <cameron@camerongray.me>
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
    var url = "http://dilbert.com/strip/" + comic.identifier.toString(date.ISODate) + "/";

    comic.comicAuthor = "Scott Adams";
    comic.firstIdentifier = "1994-01-01";
    comic.websiteUrl = url;

    var infos = {
        "User-Agent": "Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.6 (like Gecko)",
        "Accept": "text/html, image/jpeg, image/png, text/*, image/*, */*",
        "Accept-Encoding": "functionlate",
        "Accept-Charset": "iso-8859-15, utf-8;q=0.5, *;q=0.5",
        "Accept-Language": "en",
        "Host": "dilbert.com",
        "Connection": "Keep-Alive"
    }
    
    comic.requestPage(url, comic.Page, infos);
}

function getComic(data)
{
    var re = new RegExp("src=\"(http:\/\/assets.amuniversal.com\/[a-zA-Z0-9_]*)\"");
    var match = re.exec(data);

    if (match != null) {
        url = match[1];
        comic.requestPage(url, comic.Image);
    } else {
        comic.error();
    }
}

function pageRetrieved(id, data)
{
    if (id == comic.Page) {
        getComic(data);
    }
}
