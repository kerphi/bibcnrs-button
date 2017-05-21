# bibcnrs-button

BibCNRS button for a quick access to the fulltext shown near the found DOI in the visited pages

## Developers

### npm run debug

It will build and watch app/ scripts and transpile it (thanks to babel) into dist/ in the same time, firefox will be launched with the extension inside on the test/doi.html web page.

### npm run debug:real

Same as above but on real wikipedia and wiley pages.

  - https://en.wikipedia.org/wiki/Superfluid_helium-4
  - https://link.springer.com/article/10.1007/s12205-015-1634-z
  - https://link.springer.com/article/10.1007%2Fs10728-017-0342-x
  - https://link.springer.com/article/10.1007/s00701-016-2835-z

### npm run debug:prod

Same as above but with the as in production build. This could be used to debug production tricks.

### npm run build:prod

It will compile all the things ready for production in dist/ folder.

### npm run build:crx

It will create the bibcnrs-button-1.2.0.crx ready to install in your browser.
