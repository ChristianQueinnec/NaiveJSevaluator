work : nothing 

NODEVERSION	=	5.10.0
BABEL	=	node_modules/.bin/babel
JSPP	=	node_modules/.bin/beautifier

convert.with.babel : ${BABEL}
	echo '{"presets": ["es2015-node5"]}' > .babelrc
	-rm -rf dist
	mkdir -p dist 
	${BABEL} src/ --out-dir dist/

tests : convert.with.babel 
	node_modules/.bin/jasmine 

# ######################################################## Obsolete

# beautify does not pretty-print correctly `..${}..`
XXbeautify.dist.files :
	for f in dist/?*.js ; do \
	   case "$$f" in \
	      *-babel.js) continue ;; \
	      *) ${JSPP} $$f > $${f%.js}-babel.js ; \
		 mv -f $${f%.js}-babel.js $$f ;; esac ; done

# ######################################################## Once
at.beginning : 
	npm init

install.modules : 
	for module in babel babel-cli babel-preset-es2015-node5 \
		      esprima jasmine ; do\
	  npm install -g $$module && npm link $$module ; done

# end of Makefile
