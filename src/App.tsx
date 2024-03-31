import { h } from 'preact';
import { Route, Router } from 'preact-router';
import path from 'path';
import fs from 'fs';

const pagesDirectory = path.join(__dirname, 'pages');

const getPageRoutes = () => {
  const pageNames = fs.readdirSync(pagesDirectory);

  return pageNames.map((pageName) => {
    const pageIndexPath = path.join(pagesDirectory, pageName, pageName==='index.tsx'? '': 'index.tsx');
    const isMainPage = pageName === 'index.tsx';
    const routePath = isMainPage ? '/' : `/${pageName}`;
    const PageComponent = require(pageIndexPath).default;

    return { path: routePath, component: PageComponent };
  });
};

const App = ({ url }: { url: string }) => {
  const routes = getPageRoutes();
  
  return (
    <Router url={url}>
      {routes.map((route) => (
        <Route {...route} />
      ))}
    </Router>
  );
};

export default App;
