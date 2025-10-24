import GlobalError from '../global-error';

export default function Root() {
  return <GlobalError error={{ message: 'This is the error message' }} />;
}
