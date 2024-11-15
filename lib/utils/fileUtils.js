const readFileAsync = (file, readType) => {
  return new Promise((resolve, reject) => {
    if (!readType) {
      readType = "readAsArrayBuffer";
    }

    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;
    if (readType == "readAsArrayBuffer") {
      reader.readAsArrayBuffer(file);
    } else if (readType == "readAsDataURL") {
      reader.readAsDataURL(file);
    } else if (readType == "readAsText") {
      reader.readAsText(file);
    }
  });
};

const downloadFile = async (blob, fileName) => {
  const a = document.createElement("a");
  a.href = await readFileAsync(blob, "readAsDataURL");
  a.style.display = "none";
  a.download = fileName;
  a.setAttribute("download", fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const convertBytesToMbsOrKbs = (filesize) => {
  var size = "";
  if (filesize >= 1000000) {
    size = filesize / 1000000 + " megabytes";
  } else if (filesize >= 1000) {
    size = filesize / 1000 + " kilobytes";
  } else {
    size = filesize + " bytes";
  }
  return size;
};

export { readFileAsync, downloadFile, convertBytesToMbsOrKbs };
