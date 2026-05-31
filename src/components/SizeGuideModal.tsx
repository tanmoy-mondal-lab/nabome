type SizeGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SizeGuideModal({ open, onClose }: SizeGuideModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="glass size-guide" role="dialog" aria-modal="true" aria-label="Size guide" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close size guide">
          x
        </button>
        <p className="eyebrow">Fit Guide</p>
        <h2 className="heading">Find your নবME fit</h2>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Length</th>
              <th>Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["S", "38 in", "27 in", "17 in"],
              ["M", "40 in", "28 in", "18 in"],
              ["L", "42 in", "29 in", "19 in"],
              ["XL", "44 in", "30 in", "20 in"],
              ["XXL", "46 in", "31 in", "21 in"],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
