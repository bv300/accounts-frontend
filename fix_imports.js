const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            processDir(p);
        } else if (p.endsWith('.js') || p.endsWith('.jsx')) {
            let src = fs.readFileSync(p, 'utf8');
            let updated = src.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@apollo\/client['"];/g, (match, imports) => {
                if (imports.includes('useQuery') || imports.includes('useMutation') || imports.includes('ApolloProvider')) {
                    if (!imports.includes('ApolloClient') && !imports.includes('gql') && !imports.includes('InMemoryCache')) {
                        return `import {${imports}} from '@apollo/client/react';`;
                    }
                }
                return match;
            });
            if (src !== updated) {
                fs.writeFileSync(p, updated, 'utf8');
                console.log('Fixed:', p);
            }
        }
    });
}
processDir('src');
