/***************************************************************************
 *   Copyright (C) 2009 Matthias Fuchs <mat69@gmx.net>                     *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 2 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA .        *
 ***************************************************************************/

var findNewDate = new Boolean();
const mainPage = "http://www.jesusandmo.net/";

function init()
{
    comic.comicAuthor = "\"Mohammed Jones\"";
    comic.firstIdentifier = "2005-11-24";
    comic.shopUrl = "http://www.jesusandmo.net/the-shop/";

    var today = date.currentDate();
    findNewDate = (comic.identifier.date >= today.date);
    var url = mainPage;

    if (!findNewDate) {
        url += comic.identifier.toString("yyyy/MM/dd/");
    }

    comic.requestPage(url, comic.User);
}

function pageRetrieved(id, data)
{
    //find the url to the comic website
    if (id == comic.User) {
        //find the most recent date
        if (findNewDate) {
            var re = new RegExp("(http://www.jesusandmo.net/(\\d{4}/\\d{2}/\\d{2}/)[^/]+/)#comments\"");
            var match = re.exec(data);
            if (match != null) {
                comic.identifier = date.fromString(match[2], "yyyy/MM/dd");
                comic.websiteUrl = match[1];
            } else {
                comic.error();
                return;
            }
        } else {
            var re = new RegExp("<a href=\"(" + mainPage + comic.identifier.toString("yyyy/MM/dd/") + "[^\"]+)\"><img");
            var match = re.exec(data);
            if (match != null) {
                comic.websiteUrl = match[1];
            } else {
                comic.error();
                return;
            }
        }

        comic.requestPage(comic.websiteUrl, comic.Page);
    }
    if (id == comic.Page) {
        var url = mainPage + "strips/";
        var re = new RegExp("<img src=\"(" + url + comic.identifier.toString(date.ISODate) + "[^\"]+)\" alt=\"([^\"]+)\"");
        var match = re.exec(data);
        if (match != null) {
            url = match[1];
            comic.title = match[2];
            comic.requestPage(url, comic.Image);
        } else {
            comic.error();
        }

        re = new RegExp("<a href=\"" + mainPage + "(\\d{4}/\\d{2}/\\d{2}/)[^\"]+\"><span class=\"prev\">");
        match = re.exec(data);
        if (match != null) {
            comic.previousIdentifier = date.fromString(match[1], "yyyy/MM/dd/");
        }

        re = new RegExp("<a href=\"" + mainPage + "(\\d{4}/\\d{2}/\\d{2}/)[^\"]+\"><span class=\"next\">");
        match = re.exec(data);
        if (match != null) {
            comic.nextIdentifier = date.fromString(match[1], "yyyy/MM/dd/");
        }
    }
}
