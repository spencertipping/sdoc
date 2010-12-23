" Language:    SDoc
" Maintainer:  Spencer Tipping <spencer@spencertipping.com>
" URL:         http://spencertipping.com/sdoc/vim/plugin/sdoc.vim
" Project URL: http://github.com/spencertipping/sdoc

" The idea is that we look at the original filename, trim the '.sdoc' from the end, and then rerun the filetype detection to pick up the syntax. At the end, we create a custom syntax region to
" handle documentation paragraphs. Paragraphs begin at any line and end with a blank line, as matched by ^$.

fun SDocSetup()
  " Trigger autocommands to redetect the filetype without the .sdoc extension.
  execute ":doautocmd BufReadPost " . expand("%:r")

  " Add in custom syntax elements
  syn case match
  syn sync linebreaks=5

  syn region sdBlockComment start=/\(^$\n^\|\%^\)\s*[A-Z\|]/ end=/^$\|\%$/ contains=sdCoerceSDoc,sdNumberedList,sdHeading keepend
  syn match  sdHeading      /\(^$\n^\|\%^\)\s*[A-Z].\{,60\}\.$/ contained
  syn match  sdCoerceCode   /^\s*c$/
  syn match  sdCoerceSDoc   /^\s*|\(\s\|$\)/ contained
  syn region sdNumberedList start=/^\s*|\s*\d\{1,2\}\.\s\{1,2\}[A-Za-z]/me=e-1 end=/^$\|\%$/ contains=sdNumberedItem transparent
  syn match  sdNumberedItem /^\s*|\?\s*\d\{1,2\}\.\s\{1,2\}/ contained

  hi link sdBlockComment Comment
  hi link sdHeading      PreProc
  hi link sdCoerceCode   PreProc
  hi link sdCoerceSDoc   PreProc
  hi link sdNumberedItem PreProc
endfun

augroup sdoc
  autocmd!
  autocmd BufReadPost,BufNew *.sdoc execute SDocSetup()
augroup END

" Generated by SDoc 
