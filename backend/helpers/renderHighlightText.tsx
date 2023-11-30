export const renderHighlightText = (text: string, searchText: string) => {
  if (!searchText) {
    return text;
  }

  const parts = text.split(new RegExp(`(${searchText})`, "gi"));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: "#ffc069" }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};
