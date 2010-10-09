// SDoc JavaScript driver | Spencer Tipping
// Licensed under the terms of the MIT source code license

var sdocp = caterwaul.clone('std')(function () {

// Introduction.
// This driver file governs the process of rendering SDoc source as HTML. The mechanism to achieve this is fairly simple: First, the you download the sdoc.html file from this directory (hosted at
// http://spencertipping.com/sdoc/sdoc.html). The HTML file contains instructions for creating a new project; basically, it involves running 'sdoc -p' and then creating <script> tags to refer to
// the SDocP files.

// The goal of this project isn't to produce immaculate or even particularly well-formatted documentation. Nor is it designed to be flexible. Rather, it's (1) to encourage developers (especially
// me) to write well-documented code by making documentation trivial to write, and (2) to provide utility to anyone learning the codebase. SDoc in general is geared towards solving (1), and this
// HTML driver is designed to solve (2). There are several things it does to help:

// | 1. Sectioning code. Any sections the developer indicated will be preserved and promoted into proper collapsible sections.
//   2. Indexing. Each word in the code is fully searchable and indexed; it is very easy to find other occurrences of the word and search for particular usage patterns.
//   3. Looking cool. The spiffier the interface looks, the more likely developers are to spend time documenting things :)

//   Process.
//   Internally, a couple of things need to happen. First, we need to know when all of the scripts have been loaded. This is easily achieved by comparing the original list of <script>s in the
//   body to the files provided in the sdocp callbacks. Once we have each file we can start parsing, sectioning, and building indexes. (And if after some time we don't have all of the files then
//   we can display a warning to the user.)

    let[original = $.fn.append] in ($.fn.append = fn[xs][xs.constructor === Array ? (map(fn[x][x && t.append(x)], xs), this) : original.call(this, xs), where[t = this]]);

    var map = caterwaul.util.map, bind = caterwaul.util.bind,

// Logical processing.
// The first step is to process the SDoc files into a logical structure. This is then used to build the UI and search interface.

//   Parsing.
//   This is probably the simplest part of the whole process. Parsing SDoc is as simple as splitting the input into paragraphs and determining the role of each one. Because of some heuristics I'll
//   be using later on (see 'Sectioning'), we need to preserve any whitespace preceding the paragraph's first line. The format ends up being an array of snippets, where each snippet is an object of
//   the form {text: '...', role: 'comment' | 'source'}.

        parse_sdoc = fn[sdoc][caterwaul.util.map(fn[s][{text: s, role: /^\s*[A-Z]/.test(s) ? 'comment' : /^\s*\|/.test(s) ? 'pipe' : 'source'}], sdoc.split(/\n\n+/))],

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
                                     min = x.length < min.length ? x : min;
                                   return s.replace(new RegExp('(^|\\n)#{min}', 'g'), '$1')},

//   Indexing.
//   This is cool. We go through each snippet and construct an index of every word and word pair, optionally separated by up to three words in between. These indexes are mapped into a hashtable
//   from words to the 'relevance' of that pattern, where relevance is summed over matches, and each match's relevance is 1 over the number of words in between plus 1. So, for example, the text
//   'foo bar bif baz' matched on the term 'foo bif' has relevance 0.5.

             index = function (s) {var ws = s.text.split(/[^-\w]+/), x = s.index = {}; for (var i = 0, l = ws.length; i < l; ++i)
                                                                                        {x[ws[i]] = (x[ws[i]] || 0) + 1;
                                                                                         for (var j = i + 1, w = '#{ws[i]}:#{ws[j]}'; j < i + 4 && j < l; ++j) x[w] = (x[w] || 0) + 1 / (j - i)}},

//   Hierarchical sectioning.
//   Sub-sectioning is done by assigning a 'subsnippets' array to each snippet with children. The first paragraph of any section is treated kind of specially; it isn't moved into a subsnippet
//   like subsequent paragraphs; rather, it's stored directly with the section heading.

   fold_subsections = fn[s, ss, i][s && ss[i] ? ss[i].section ? ss[i].level <= s.level ? i : ((s.subsnippets = s.subsnippets || []).push(ss[i]),
                                                                                              fold_subsections(s, ss, fold_subsections(ss[i], ss, i + 1))) :
                                                                ((s.subsnippets = s.subsnippets || []).push(ss[i]), fold_subsections(s, ss, i + 1)) : i],

//   File sectioning.
//   Each file is broken down into sections. Once we have the contents of each file, we replace its raw text by the hierarchical arrangement of sections. The file's section 'level' is assumed to
//   be zero.

       process_file = fn[filename, text][let[snippets = parse_sdoc(text)] in (map(mark_section, snippets), map(mark_pipe, snippets), map(index, snippets),
                                                                              fold_subsections(result, snippets, 0), result, where[result = {section: filename, index: {}, level: 0, text: ''}])],

// Rendering.
// Once files have been broken down into hierarchical sections, we can render them as HTML. This is fairly straightforward; most of the markup is derived directly from the structure of the
// snippets. Later on I'll put in some code to actually process the text and insert semantic markup there.

         render_toc = fn[s][s.section && $('<li class="snippet">').data('snippet', s).append(
                                           $('<a href="##{s.section}">').text(s.section).append($('<ul>').append(map(render_toc, s.subsnippets || []))))],

     render_snippet = fn[s][s.section ? $('<section class="snippet" id="#{s.section}">').data('snippet', s).append($('<h#{s.level + 1}>').text(s.section)).append(
                                          $('<div>').append($('<p>').text(s.text)).append(map(render_snippet, s.subsnippets || []))) :
                     s.role === 'pre' ? $('<pre class="snippet">').data('snippet', s).text(outdent(s.text)) :
                  s.role === 'source' ? $('<pre class="source snippet">').data('snippet', s).text(outdent(s.text)) :
               s.role === 'enumerate' ? $('<ol class="snippet" start="#{s.start}">').data('snippet', s).append(map(fn[s][$('<li>').data('snippet', s).text(s)], s.items)) :
                                        $('<p class="snippet">').data('snippet', s).text(s.text)],

             render = fn[filename, source][let[parsed = process_file(filename, source)] in $(fn_[$('#source').append(render_snippet(parsed)), $('#toc > ul').append(render_toc(parsed))])];

  $(fn_[$(document).keypress(fn[e][e.which === '/'.charCodeAt(0) ? $('#search input').select().focus() : true]),
        $('body').append($('<div id="source">')).append($('<div id="toc"><ul>')).append($('<div id="search">').append($('<input>').
                    bind('keypress change', let[timeout = null] in
                                            fn_[let[v = $(this).val()] in (
                                                timeout && clearTimeout(timeout),
                                                timeout = setTimeout(fn_[v.length ? $('.snippet').each(fn_[$(this).data('snippet').index[v] ? $(this).show() : $(this).hide()]) :
                                                                                    $('.snippet').show()], 100))])))]);

  return render})();

// Generated by SDoc 