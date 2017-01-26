
set nocompatible              " required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'
Plugin 'tpope/vim-fugitive'
Plugin 'tmhedberg/SimpylFold'
" Add all your plugins here (note older versions of Vundle used Bundleinstead of Plugin)


" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required



filetype plugin indent on
set tabstop=4
set shiftwidth=4
set expandtab

:so ~/.vim/ftplugin/python/ipy.vim

set number
set autoindent
set backspace=indent,eol,start
syntax on
filetype on
filetype plugin on

fun BreakLine()
  if (mode() == 'i')
    return ((getline(".")[col(".")-2] == '{' && getline(".")[col(".")-1] == '}') ||
          \(getline(".")[col(".")-2] == '(' && getline(".")[col(".")-1] == ')'))
  else
    return 0
  endif
endfun

" autocmdble folding
set foldmethod=indent
set foldlevel=99

" FileTypeble folding with the spacebar
nnoremap <space> za

autocmd FileType html setlocal shiftwidth=2 tabstop=2
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2
autocmd FileType css setlocal shiftwidth=2 tabstop=2

au BufNewFile,BufRead *.py
    \ set tabstop=4
    \ set softtabstop=4
    \ set shiftwidth=4
    \ set textwidth=79
    \ set expandtab
    \ set autoindent
    \ set fileformat=unix

au BufRead,BufNewFile *.py,*.pyw,*.c,*.h match BadWhitespace /\s\+$/

set encoding=utf-8

set nu


set clipboard=unnamed
set showcmd
set wildmenu 
set lazyredraw
set showmatch
set incsearch           " search as characters are entered
set hlsearch            " highlight matches

:colorscheme badwolf
