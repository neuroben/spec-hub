import { Button, Result } from 'antd';
import { isRouteErrorResponse, useRouteError } from 'react-router';

/** Route error boundary — also covers failed lazy chunk loads (e.g. after a deploy). */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={message}
      extra={<Button onClick={() => window.location.reload()}>Reload</Button>}
    />
  );
}
