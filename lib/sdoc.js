// SDoc JavaScript driver | Spencer Tipping
// Licensed under the terms of the MIT source code license

// Introduction.
// This driver file governs the process of rendering SDoc source as HTML (if you have no idea what SDoc is or why you should use it, then see 'What SDoc is and why you should use it', below). The
// mechanism to achieve this is fairly simple: First, the you download the sdoc.html file from this directory (hosted at http://spencertipping.com/sdoc/sdoc.html). The HTML file contains
// instructions for creating a new project; basically, it involves running 'sdoc -p' and then creating <script> tags to refer to the SDocP files.

// The goal of this project isn't to produce immaculate or even particularly well-formatted documentation. Nor is it designed to be flexible. Rather, it's (1) to encourage developers (especially
// me) to write well-documented code by making documentation trivial to write, and (2) to provide utility to anyone learning the codebase. SDoc in general is geared towards solving (1), and this
// HTML driver is designed to solve (2). There are several things it does to help:

// | 1. Sectioning code. Any sections the developer indicated will be preserved and promoted into proper collapsible sections.
//   2. Indexing. Each word in the code is fully searchable and indexed; it is very easy to find other occurrences of the word and search for particular usage patterns.
//   3. Looking cool. The spiffier the interface looks, the more likely developers are to spend time documenting things :)

// What SDoc is and why you should use it.
// SDoc stands for 'Simple Documentation', and that's what it tries to be. It's two things. It's a format for writing code (more about the comments than the code, really), and it's a small set of
// tools to (1) transform this format into regular code, and (2) make cool-looking HTML pages out of your source (like this one, in fact). SDoc is also designed to be more fun to write than
// normal code is; it makes writing comments much easier, and it also provides a really easy way to create sections and cross-references.

//   What SDoc code looks like.
//   Imagine your code, but with no comment markers at all. That's basically what SDoc looks like. For example, consider this regular Java code (ignore the vertical bars on the left):

//   | | // Foo.java
//     | // Written by Edsger Dijkstra
//     | // GPL
//     |
//     | /** The Foo class prints 'hello world' to the screen.
//     |   * Because of the immense complexity of this class,
//     |   * it requires a dissertation-length paragraph of
//     |   * documentation....
//     |   *
//     |   * And a second paragraph too, in fact.... */
//     | public class Foo {
//     |   /** The main() method actually does the work.
//     |     * It should run in constant-time, but who really
//     |     * cares anyway -- I mean, it's a hello world
//     |     * program -- like seriously. */
//     |   public static void main(final String[] args) {
//     |     System.out.println("hello world");
//     |   }
//     | }

//   Here's how to format it in SDoc:

//   | | Foo | Edsger Dijkstra
//     | GPL
//     |
//     | The Foo class.
//     | Prints 'hello world' to the screen. Because of
//     | the immense complexity of this class, it requires
//     | a dissertation-length paragraph of documentation...
//     |
//     | And a second paragraph too, in fact....
//     |
//     | public class Foo {
//     | 
//     |   The main() method.
//     |   Actually does the work. It should run in
//     |   constant-time, but who really cares anyway --
//     |   I mean, it's a hello world program -- like
//     |   seriously.
//     |
//     |   public static void main(final String[] args) {
//     |     System.out.println("hello world");
//     |   }
//     | }

//   When you run the sdoc tool, it automatically converts your SDoc-formatted source into regular code. It uses a simple heuristic to figure out which lines are comments. It splits your document
//   into paragraphs (where paragraphs are separated by blank lines), and paragraphs starting with a capital letter or pipe symbol (|) are comments. The others are code. SDoc knows how to comment
//   over 30 languages based on their file extension, and will comment out the appropriate paragraphs automatically. Code paragraphs are left alone and printed verbatim, and all line numbers are
//   preserved.

//   In addition to commenting things out, SDoc provides an HTML page of your source. It infers section headings by looking for paragraphs that start with short lines ending in a period. (For
//   example, the 'Foo' and 'main()' paragraphs in the example above each start a section. A 'short line' is one that is at least ten characters shorter than the one after it.) It also determines
//   the section level of those headings; this is inferred from the indentation. Each level uses two spaces of indentation (and SDoc is not smart about tabs); so, for example, the sections in the
//   above code would be:

//   | - The Foo class
//       - The main() method

//   Paragraphs starting with a pipe symbol are treated specially. If they start with a number, a period, and some spaces, then they are considered to be a numbered list; for example, this SDoc:

//   | | 1. Foo
//       2. Bar

//   Produces this HTML:

//   | 1. Foo
//     2. Bar

//   If a pipe paragraph doesn't look like a numbered list, then it's treated as either ASCII art or a code example (both render the same way).

//   Formatting.
//   SDoc doesn't and never will provide ways to format things. This includes:

//   | 1. Boldface text
//     2. Italic text
//     3. Monospace text
//     4. Links that don't start with http:// and look like links
//     5. Colors
//     6. The <blink> tag

//   The reason for this is that formatters often get things wrong. I was actually on the fence about providing numbered lists, but they look enough better as HTML and are accurately-recognized
//   enough that I was willing to go for it. But the whole idea behind SDoc is that you should never think about the fact that you're writing documentation, or have to remember how to do it. It
//   should be completely natural, and as easy as typing out an idea while you're thinking out loud, to write good documentation that produces well-organized code and good-looking HTML.

// Using SDoc.
// There are two things you need to do to use SDoc. First, you should obtain a copy of SDoc (available at http://github.com/spencertipping/sdoc), and as part of this process put the 'sdoc' script
// somewhere in your $PATH and put the contents of the 'vim' directory in your '~/.vim'. (This enables vim syntax highlighting -- sorry, no emacs support yet.)

//   The SDoc script and sdoc.html.
//   Here's an example development session with SDoc:

//   | $ vim Foo.java.sdoc         # hack away
//     $ sdoc                      # generate Foo.java (it processes all .sdoc files in the current directory)
//     $

//   That's it. Now you have Foo.java, and you can compile it normally. If you also want HTML documentation, then you'd do this instead (or in addition, it doesn't matter):

//   | $ vim Foo.java.sdoc         # hack away
//     $ sdoc -p                   # generate Foo.java and Foo.java.sdocp, which is used for the HTML interface
//     $ wget http://spencertipping.com/sdoc/sdoc.html
//     $ vim sdoc.html             # follow the included instructions to create your HTML file
//     $

//   Then you can navigate to sdoc.html and you should have a working, searchable page of documentation. (Probably doesn't work in IE, and probably never will.)

// Internals of the conversion process.
// Everything from here down is just documentation for the JS driver that does the conversion. It contains no useful information about how to use SDoc.

var sdocp = caterwaul.clone('std')(function () {

//   JQuery extensions.
//   We need a couple of things. First, jQuery needs to be able to append an array of elements to something, so we pluralize append() below. Next, we need a nice animation to use for showing and
//   hiding things.

    let[original = $.fn.append] in ($.fn.append = fn[xs][xs && xs.constructor === Array ? (map(fn[x][x && t.append(x)], xs), this) : original.call(this, xs), where[t = this]]);

    $.fn.appear    = fn_[this.show()];
    $.fn.disappear = fn_[this.hide()];

    var map = caterwaul.util.map, bind = caterwaul.util.bind,

// Logical processing.
// The first step is to process the SDoc files into a logical structure. This is then used to build the UI and search interface.

//   Parsing.
//   This is probably the simplest part of the whole process. Parsing SDoc is as simple as splitting the input into paragraphs and determining the role of each one. Because of some heuristics I'll
//   be using later on (see 'Sectioning'), we need to preserve any whitespace preceding the paragraph's first line. The format ends up being an array of snippets, where each snippet is an object of
//   the form {text: '...', role: 'comment' | 'source'}.

        parse_sdoc = fn[sdoc][caterwaul.util.map(fn[s][{text: s, role: /^\s*[A-Z]/.test(s) ? 'comment' : /^\s*\|/.test(s) ? 'pipe' : 'source'}], sdoc.split(/\n\n+/))],

//   Module title, author, and prelude.
//   The first paragraph is usually (when I write it, anyway) formatted like this:

//   | Module name | Author
//     Licensed under the terms of X license

//   It gets formatted specially to reflect this. Its role is 'prelude', and it has the fields 'name', 'author', and 'text' (where 'text' is everything but the first line).

     parse_prelude = fn[s][parts && (s.role = 'prelude', s.name = parts[1], s.author = parts[2], s.text = parts[3] || ''), s, where[parts = /^\s*([^|]+)\|(.*)\n?((?:.|\n)*)/.exec(s.text)]],

//   Sectioning.
//   Next we need to determine the sections in a document. Informally, sections are 'short lines that start paragraphs and end in a dot'. For example, the 'Sectioning' line at the top of this
//   paragraph starts a section. The level of sectioning is determined by indentation -- two spaces per level. Some heuristics are used here. First, the section line must be at least 10
//   characters shorter than the next one; otherwise, it's probably just a line-wrap. Second, it must start with a capital letter instead of a pipe symbol. (I'll get to what the pipe symbols mean
//   in a bit.)

//   A snippet is marked as having sections like this: {text: '...', role: 'comment', section: 'Foo', level: 2}, where 'level' starts at 1.

      mark_section = fn[s][let[pieces = /^(\s*)([A-Z].*)\.\n(\s*)((?:.|\n)*)$/.exec(s.text)] in (s.role === 'comment' && pieces && pieces[2].length + 10 < pieces[4].length &&
                                                                                                 (s.text = pieces[3] + pieces[4], s.section = pieces[2], s.level = 1 + (pieces[1].length >> 1))), s],

//   Pipe-paragraph inference.
//   Paragraphs that start with pipes are interesting, because the user had to indicate that they wanted documentation in a situation where the text for some reason looks like code. Most of the
//   time it really is code being presented in example context, but sometimes it's something else. It could be:

//   | 1. A numbered list (like this one, ha!)
//     2. ASCII art
//     3. A code example
//     4. A continuation of a previous paragraph (but don't use | for that!)

//   I can't think of anything else it's likely to be at the moment. So, with these things in mind, here are the heuristics I'm using for inference:

//   | 1. Numbered lists start with /\d{1,2}\.\s{1,2}[A-Za-z]/. That is, one or two digits, a dot, and one or two spaces followed by a letter.
//     2. ASCII art starts with three or more spaces.
//     3. Code snippets start with anything else. (This is why you shouldn't use | for normal text.)

//   Snippets come out with semantic information: numbered lists have the 'enumerate' role and an 'items' array, where the values are the text (newlines and other whitespace intact). Note that
//   the numbering is not smart; it won't follow you if you have skips. For example, if you number a list '2, 3, 5, 7, 11, 13', it will give you a list numbered as '2, 3, 4, 5, 6, 7'. This is
//   partially due to an HTML limitation, and partially due to the fact that I'm too lazy to accommodate this bizarre case. ASCII art and code snippets are the same; each gets its role changed to
//   'pre', and the text loses its pipe symbol.

         mark_pipe = fn[s][s.role === 'pipe' && (number ? (s.role = 'enumerate', s.start = Number(number[1]), s.items = [],
                                                           s.text.replace(/\.\s{1,2}([A-Za-z](?:.|\n\s*[^\s0-9])*)/g, fn[_, t][s.items.push(t), _])) :
                                                          (s.role = 'pre', s.text = s.text.replace(/^(\s*)\|/, '$1 ')),
                                                 where[number = /^\s*\|?\s*(\d{1,2})\.\s{1,2}[A-Za-z]/.exec(s.text)])],

//   Source trimming.
//   Source code should be outdented to make optimal use of screen space.

           outdent = function (s) {for (var i = 0, xs = s.split(/\n+/), l = xs.length, x, min = s.replace(/./g, ' '); (x = xs[i] && /^(\s*)[^\s]/.exec(xs[i])) && (x = x[1]), i < l; ++i)
                                     min = x && x.length < min.length ? x : min;
                                   return s.replace(new RegExp('(^|\\n)#{min}', 'g'), '$1')},

//   Indexing.
//   This is cool. We go through each snippet and construct an index of every word and word pair, optionally separated by up to ten words in between. These indexes are mapped into a hashtable
//   from words to the 'relevance' of that pattern, where relevance is summed over matches, and each match's relevance is 1 over the number of words in between plus 1. So, for example, the text
//   'foo bar bif baz' matched on the term 'foo bif' has relevance 0.5.

             index = function (s) {var ws = ((s.section || '') + s.text).split(/[^-\w]+/), x = s.index = {};
                                   for (var i = 0, l = ws.length; i < l; ++i) {x[ws[i]] = (x[ws[i]] || 0) + 1;
                                                                               for (var j = i + 1, w; w = '#{ws[i]}:#{ws[j]}', j < i + 10 && j < l; ++j) x[w] = (x[w] || 0) + 1 / (j - i)}},

//   Hierarchical sectioning.
//   Sub-sectioning is done by assigning a 'subsnippets' array to each snippet with children. The first paragraph of any section is treated kind of specially; it isn't moved into a subsnippet
//   like subsequent paragraphs; rather, it's stored directly with the section heading.

   fold_subsections = fn[s, ss, i][s && ss[i] ? ss[i].section ? ss[i].level <= s.level ? i : ((s.subsnippets = s.subsnippets || []).push(ss[i]),
                                                                                              fold_subsections(s, ss, fold_subsections(ss[i], ss, i + 1))) :
                                                                ((s.subsnippets = s.subsnippets || []).push(ss[i]), fold_subsections(s, ss, i + 1)) : i],

//   Add indexes.
//   Each parent has its children's indexes merged in with its own, so that it represents its children for searching.

      merge_indexes = function (s) {if (s && s.subsnippets) for (var i = 0, l = s.subsnippets.length, sub; sub = merge_indexes(s.subsnippets[i]), i < l; ++i)
                                                              for (var k in sub.index) s.index[k] = (s.index[k] || 0) + sub.index[k];
                                    return s},

//   File sectioning.
//   Each file is broken down into sections. Once we have the contents of each file, we replace its raw text by the hierarchical arrangement of sections. The file's section 'level' is assumed to
//   be zero.

       process_file = fn[filename, text][let[snippets = parse_sdoc(text)] in (parse_prelude(snippets[0]),
                                                                              map(mark_section, snippets), map(mark_pipe, snippets), map(index, snippets), fold_subsections(result, snippets, 0),
                                                                              merge_indexes(result), where[result = {snippets: snippets, section: filename, index: {}, level: 0, text: ''}])],

// Rendering.
// Once files have been broken down into hierarchical sections, we can render them as HTML. This is fairly straightforward; most of the markup is derived directly from the structure of the
// snippets. Later on I'll put in some code to actually process the text and insert semantic markup there.

         render_toc = fn[s][s.section && $('<a href="##{s.section}">').snippet(s).append($('<li>').text(s.section).append($('<ul>').append(map(render_toc, s.subsnippets || []))))],

        escape_html = fn[s][s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')],
      unescape_html = fn[s][s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')],

           html_for = fn[s, root][tag_words(cross_reference(detect_links(escape_html(outdent(s.text || ''))), root), root && root.index || s.index || {})],
     render_snippet = fn[root][fn[s][s.section ? $('<section id="#{s.section}">').snippet(s).append($('<h#{s.level + 1}>').text(s.section)).append(
                                                   $('<div>').append($('<p>').html(html_for(s, root))).append(map(render_snippet(root), s.subsnippets || []))) :
                              s.role === 'pre' ? $('<pre>').snippet(s).html(html_for(s, root)) :
                           s.role === 'source' ? $('<pre class="source">').snippet(s).html(html_for(s, root)) :
                          s.role === 'prelude' ? $('<header>').append($('<h2 class="name">').text(s.name)).append($('<h3 class="author">').append(s.author)).append($('<p>').html(html_for(s, root))) :
                        s.role === 'enumerate' ? $('<ol start="#{s.start}">').snippet(s).append(map(fn[s][$('<li>').snippet(s).text(s)], s.items)) :
                                                 $('<p>').snippet(s).html(html_for(s, root))]],

//   Cross-referencing.
//   If you put a section name into single or double quotes, like this: "Cross-referencing", then it will become a link to that section. It's case-sensitive, but other than that has no particular
//   oddities.

    cross_reference = function (html, root) {for (var i = 0, l = root.snippets.length, s; s = root.snippets[i] && root.snippets[i].section, i < l; ++i)
                                               s && (html = html.split('"#{s}"').join('<a href="##{s}" class="cross-reference">#{s}</a>').
                                                                 split("'#{s}'").join('<a href="##{s}" class="cross-reference">#{s}</a>'));
                                             return html},

//   Hyperlink detection.
//   Anything that looks like a hyperlink, minus trailing punctuation, will be turned into a proper link that opens in a new window.

       detect_links = fn[escaped_html][escaped_html.replace(/\w+:\/\/(?:[^\s\w]*\w)+/g, fn[s]['<a class="link" href="#{unescape_html(s)}" target="_blank">#{s}</a>'])],

//   Word tagging.
//   Each searchable term in a source snippet is tagged, which implementation-wise means that it is wrapped in an <a class='tag'> whose href is the term to be searched for. These hrefs can be
//   used normally by the browser, since #/x hashtags search for x.

       words_to_tag = function (snippets) {for (var i = 0, r = {}, l = snippets.length, s; s = snippets[i], i < l; ++i) s.role === 'source' && $.extend(r, s.index || {}); return r},

          tag_words = function (html, index) {for (var i = 0, ws = html.split(/(\W*&\w+;\W*|\W*<a.*?<\/a>|\W*<\/?\w+[^>]*>|\W+)/i), l = ws.length, w; w = ws[i], i < l; i += 2)
                                                if (Object.hasOwnProperty.call(index, w)) ws[i] = '<a class="tag" href="#/#{w}">#{w}</a>';
                                              return ws.join('')},

     index_of_words = function (index) {var ws = []; for (var k in index) /:/.test(k) || ws.push(k); return map(fn[w]['<a href="#/#{w}"><li>#{w}</li></a>'], ws.sort())},

             render = fn[filename, source][let[parsed = process_file(filename, source)] in $(fn_[let[ws = words_to_tag(parsed.snippets)] in
                                                                                                 ($('#source').append(render_snippet(parsed)(parsed)),
                                                                                                  $('#index > ul').append(index_of_words(ws).join('')),
                                                                                                  $('#toc > ul').append(render_toc(parsed)))])];

//   Search box processing.
//   Handles the word highlighting (on a matching search) and the document/TOC truncation to the matching snippets.

  $(fn_[$(document).keypress(fn[e][document.activeElement !== $('#search input')[0] && e.which === '/'.charCodeAt(0) ? ($('#search input').select().focus(), e.preventDefault()) : true]),
        $('body').append($('<div id="source">')).append($('<div id="toc"><h1>Contents</h1><ul>')).append($('<div id="index"><h1>Index</h1><ul>')).append($('<div id="search">').
                    append($('<input>').bind('keyup change', let[timeout = null] in
                                                             fn_[let[ws = $(this).val() && $(this).val().split(/\W+/)] in
                                                                 (document.location.hash = '#/#{$(this).val()}',
                                                                  timeout && clearTimeout(timeout),
                                                                  timeout = setTimeout(fn_[ws && ws.length ?
                                                                    ($('.snippet').each(fn_[let[i = $(this).snippet().index] in
                                                                                            ($(this)[(i && Object.prototype.hasOwnProperty.call(i, ws.join(':')) ? '' : 'dis') + 'appear']())]),
                                                                     $('a.highlighted').removeClass('highlighted'),
                                                                     map(fn[w][$('a.tag[href="#/#{w}"]').addClass('highlighted')], ws)) :
                                                                    ($('.snippet').appear(), $('a.highlighted').removeClass('highlighted'))], 200))]))),
        $('#search input').focus()]);

  $.fn.snippet = fn[s][s ? this.data('snippet', s).addClass('snippet').addClass('role-#{s.role}') : this.data('snippet')];

  setInterval(let[last = null] in fn_[document.location.hash !== last && $('#search input')[0] !== document.activeElement && (pieces && $('#search input').val(pieces[1]).change(),
                                      where[pieces = /^#\/(.*)/.exec(last = document.location.hash)])], 100);

  return render})();

// Generated by SDoc 