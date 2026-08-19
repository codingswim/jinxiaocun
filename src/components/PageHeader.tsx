import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

/**
 * 公共页面头部组件：统一页面标题与描述样式
 */
function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <div>
        <h2 style={{ marginBottom: 4 }}>{title}</h2>
        {description && (
          <span style={{ color: '#999', fontSize: 13 }}>{description}</span>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}

export default PageHeader;
