/*
 *   Copyright (C) 2008 Matthias Fuchs <mat69@gmx.net>
 *   Copyright (C) 2009 Stephan Renatus <srenatus@students.uni-mainz.de>
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

//NOTE only this part needs to be changed to support different comics
const author = "Stephan Pastis";
const websitePart = "pearls_before_swine"; //e.g. the "garfield" in "http://www.gocomics.com/garfield/"
const comicName = "Pearls Before Swine"; //needed to find the most recent strip, the name that is displayed next to the "by comic author" on the website
const firstIdentifier = "2002-01-06";
const shopUrl = "http://www.cafepress.com/pearls";

const infos = {
        "User-Agent": "Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.6 (like Gecko)",
        "Accept": "text/html, image/jpeg, image/png, text/*, image/*, */*",
        "Accept-Encoding": "functionlate",
        "Accept-Charset": "iso-8859-15, utf-8;q=0.5, *;q=0.5",
        "Accept-Language": "en",
        "Host": "gocomics.com",
        "referrer": "http://www.gocomics.com/",
        "Connection": "Keep-Alive"
}

function init()
{
    comic.comicAuthor = author;
    comic.firstIdentifier = firstIdentifier;
    comic.websiteUrl = "http://www.gocomics.com/" + websitePart + '/';
    comic.shopUrl = shopUrl;

    comic.requestPage(comic.websiteUrl, comic.User, infos);
}

function pageRetrieved(id, data)
{
    //find lastIdentifier
    if (id == comic.User) {
        var exp = new RegExp("(\\d{4}/\\d{2}/\\d{2})/?\">" + comicName);
        var match = exp.exec(data);
        if (match != null) {
            comic.lastIdentifier = date.fromString(match[1], "yyyy/MM/dd");
            comic.websiteUrl += comic.identifier.toString("yyyy/MM/dd");
            comic.requestPage(comic.websiteUrl, comic.Page, infos);
        } else {
            print("Could not find last identifier.");
            comic.error();
            return;
        }
    }

    //find comic strip and next/previous identifier
    if (id == comic.Page) {
        var exp = new RegExp("(\\d{4}/\\d{2}/\\d{2})\" class=\"next\"");
        var match = exp.exec(data);
        if (match != null) {
            comic.nextIdentifier = date.fromString(match[1], "yyyy/MM/dd");
        }

        exp = new RegExp("(\\d{4}/\\d{2}/\\d{2})\" class=\"prev\"");
        match = exp.exec(data);
        if (match != null) {
            comic.previousIdentifier = date.fromString(match[1], "yyyy/MM/dd");
        }

        // was: exp = new RegExp("class=\"strip\" src=\"([^\"]+)\\?width[^\"]+\"");
        exp = new RegExp("class=\"strip\" src=\"([^\"]+)\" />");
        match = exp.exec(data);
        if (match != null) {
            comic.requestPage(match[1], comic.Image, infos);
        } else {
            exp = new RegExp("<link rel=\"image_src\" href=\"([^\"]+)\"");
            match = exp.exec(data);
            if (match != null) {
                comic.requestPage(match[1], comic.Image, infos);
            } else {
                print("Could not find comic image.");
                comic.error();
                return;
            }
        }
    }
}
