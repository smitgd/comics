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

const siteRoot = "http://www.arcamax.com";
const stripId = "/thefunnies/babyblues";

/*
 * Note: This site archives strips based on a "string" style identifier
 * so only sequential access is possible to images stored at the site
 * (approximately 1 months worth) or older images if stored in the
 * plasma_engine_comic/ cache directory. Selection by date does not
 * seem to be possible.
 */

function init()
{
	comic.comicAuthor = "\"Rick Kirkman\", \"Jerry Scott\"";
	comic.websiteUrl = siteRoot + stripId;
	comic.shopUrl = "http://www.babyblues.com/bbstore.html";

	print("init");

	//check if the comic.identifier is empty
	if (comic.identifier != new String())
	{
		comic.websiteUrl += comic.identifier;
		comic.requestPage(comic.websiteUrl, comic.Page);
	}
	else
	{
		comic.requestPage(comic.websiteUrl, comic.User);
	}
	print(comic.websiteUrl);
}

// example matching lines for various RegExp below:
// Note: These no longer match as of 6-27-2015 fix. See below
//
// <a href="/thefunnies/babyblues/s-1484640"><img src="/newspics/98/9821/982131.gif" alt="Baby Blues Cartoon for Mar/10/2014"></a>
// <a href="/thefunnies/babyblues/s-1493661"><img src="http://www.arcamax.com/newspics/99/9966/996632.gif" alt="Baby Blues Cartoon for Mar/27/2014" rel="image_src"></a>
// <a href="/thefunnies/babyblues/s-1483451"><img src="/newspics/cache/lw600/98/9802/980295.jpg" alt="Baby Blues Cartoon for Mar/09/2014"></a>
// <a class="prev" href="/thefunnies/babyblues/s-1482911"><span>&laquo;</span></a>
// <a class="next" href="/thefunnies/babyblues/s-1484640"><span>&raquo;</span></a>

function pageRetrieved(id, data)
{
	// find most recent strip
	if (id == comic.User)
	{
		//var re = new RegExp("<a href=\""+stripId+"(/s-[0-9]+)\"");
		var re = new RegExp("<a href=\".*"+stripId+"(/s-[0-9]+)\"");
                // 6-27-2105 fix now matches this example:
                // <a href="http://www.facebook.com/sharer.php?u=http://www.arcamax.com/thefunnies/babyblues/s-1678411
		var match = re.exec(data);
		if (match != null)
		{
			comic.lastIdentifier = match[1];
			comic.identifier = comic.lastIdentifier;
			comic.websiteUrl += comic.identifier;
			comic.requestPage(comic.websiteUrl, comic.Page);
			print(comic.websiteUrl);
		}
		else
		{
			print("Can't find page with current strip")
			comic.error();
		}
	}

	if (id == comic.Page)
	{
		// Note: Sunday is larger jpg, weekdays are gif
		//var re = new RegExp("<img src=\".*(/newspics.*(gif|jpg))");
		var re = new RegExp(" data-zoom-image=\".*(/newspics.*(gif|jpg))");
                // 6-27-2015 fix (was broken) now matches this example:
                // data-zoom-image="/newspics/121/12193/1219355.gif
		var match = re.exec(data);
		if (match != null)
		{
			comic.requestPage(siteRoot + match[1], comic.Image, {"referrer":comic.websiteUrl});
		}
		else
		{
			print("no gif/jpg found...?");
			comic.error();
			return;
		}

		re = new RegExp("<a class=\"prev\" href=\""+stripId+"(/s-[0-9]+)\"");
		match = re.exec(data);
		if (match != null)
		{
			comic.previousIdentifier = match[1];
			print(comic.previousIdentifier);
		}
		else
		{
			print("No prev: at last archived strip");
		}

		re = new RegExp("<a class=\"next\" href=\""+stripId+"(/s-[0-9]+)\"");
		match = re.exec(data);
		if (match != null)
		{
			comic.nextIdentifier = match[1];
			print(comic.nextIdentifier);
		}
		else
		{
			print("No next: at the current strip.");
		}
	}
}
