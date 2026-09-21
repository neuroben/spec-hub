import { Empty } from 'antd';

/** Empty-state placeholder until the owning lane fills the panel. */
export function PanelPlaceholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="panel-placeholder">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<><strong>{title}</strong><br />{hint}</>} />
    </div>
  );
}
