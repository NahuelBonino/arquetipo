import Loader from "@/components/Loader/loader";
import useMensaje from "@/hooks/useMensaje";
import { apiFileClient, apiFileDownload } from "@/lib/apiClient";
import { convertBytesToMbsOrKbs, readFileAsync } from "@/lib/utils/fileUtils";
import { CloseOutlined } from "@mui/icons-material";
import GetAppIcon from "@mui/icons-material/GetApp";
import PublishIcon from "@mui/icons-material/Publish";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { DropzoneAreaBase } from "mui-file-dropzone";
import PropTypes from "prop-types";
import { useState } from "react";
import CsvToHtmlTable from "./CsvToHtmlTable";


export function parseCsvToRowsAndColumn(csvText, csvColumnDelimiter = ",") {
  const rows = csvText.split("\n");
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map((row) => row.split(csvColumnDelimiter));
}

const CsvBulkUpload = (props) => {
  const { addMessage } = useMensaje(props.lng);
  let t = props.t;
  let buttonTitle = props.bulk_upload_title;
  let dialogTitle = props.bulk_dialog_title;
  let step1Title = props.bulk_step1_title;
  let step2Title = props.bulk_step2_title;
  let step3Title = props.bulk_step3_title;
  let entity = props.entity;
  let online = props.online;
  let search = props.search;
  let filter = props.filter;

  const [activeStep, setActiveStep] = useState(1);
  const [open, setOpen] = useState(false);
  const filesLimit = 1;
  const [files, setFiles] = useState([]);
  const [fileObjects, setFileObjects] = useState([]);
  const [fileData, setFileData] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");
  const [errorsMessages, setErrorMessages] = useState("");
  const [finalResult, setFinalResult] = useState([]);
  const [isAsync, setAsync] = useState(false);
  const [steps, setSteps] = useState([step1Title, step2Title, step3Title]);
  const [isStartDownload, setStartDownload] = useState(false);

  //if async only 2 step
  const handleNext = () => {
    if (activeStep == 2) {
      handleClose();
    }
    if (activeStep == 1) {
      if (isAsync) {
        handleClose();
      } else {
        handleSend();
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
    if (activeStep == 0) {
      let errors = props.validate(fileData);
      if (errors.length == 0) {
        //if async in this step send the file , in async mode we have only 2 step
        if (isAsync) {
          handleSend();
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        setErrorMessages(errors);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrorMessages(null);
    setFinalMessage(null);
    setFinalResult(null);
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await uploadCsv();
      if (isAsync) {
        setFinalMessage(t("bulk_final_message_async_success"));
        setFinalResult(null);
      } else {
        setFinalMessage(t("bulk_final_message_success"));
        setFinalResult(result);
        if (search) {
          search();
        }
      }
    } catch (error) {
      addMessage(JSON.stringify(error), "error");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setActiveStep(0);
    setFileData("");
    setFileObjects([]);
    setFiles([]);
    setOpen(false);
    setSteps([step1Title, step2Title, step3Title]);
    setFinalMessage(null);
    setFinalResult(null);
    setErrorMessages(null);
    setAsync(false);
  };

  const handleOpen = () => {
    setActiveStep(0);
    setFileData("");
    setFileObjects([]);
    setFiles([]);
    setOpen(true);
    setSteps([step1Title, step2Title, step3Title]);
    setFinalMessage(null);
    setFinalResult(null);
    setErrorMessages(null);
    setAsync(false);
  };

  const handleDownload = async () => {
    if (isStartDownload) {
      return;
    }

    try {
      setStartDownload(true);
      const file = await apiFileDownload.post("/v1/bulk/download", "", {
        params: {
          entityName: entity,
          typeFile: "csv",
          filterString: JSON.stringify(filter),
        },
        responseType: "blob",
      });

      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(file);
      link.download = "report_" + entity + ".csv";
      link.click();
    } catch (error) {
      alert("Error : Service not available " + JSON.stringify(error));
    }
    setStartDownload(false);
  };

  const handleDelete = (deleted) => {
    setActiveStep(0);
    setFileData("");
    setFileObjects([]);
    setFiles([]);
    setSteps([step1Title, step2Title, step3Title]);
    setFinalMessage(null);
    setFinalResult(null);
    setErrorMessages(null);
    setAsync(false);
  };

  const handleAdd = async (newFiles) => {
    let fileAdd = newFiles[0];
    setFileObjects([fileAdd]);
    let fileString = await readFileAsync(fileAdd.file, "readAsText");
    let cvsData = parseCsvToRowsAndColumn(fileString);
    if (cvsData.length > online) {
      //must be async
      setAsync(true);
      setSteps([step1Title, step3Title]);
    } else {
      setAsync(false);
    }

    setFileData(cvsData);
  };

  const isFile = (input) => "File" in window && input instanceof File;

  const uploadCsv = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        let content = fileObjects[0].file;
        if (isFile(content)) {
          content = await readFileAsync(content);
        }
        let result = await apiFileClient.post("/v1/bulk/upload", content, {
          params: {
            entityName: entity,
            typeFile: "csv",
            async: isAsync,
          },
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <>
      <IconButton
        color="primary"
        aria-label="{'download'}"
        onClick={handleDownload}
      >
        {!isStartDownload && <GetAppIcon />}
        {isStartDownload && <Loader />}
      </IconButton>

      <Button
        color="secondary"
        variant="contained"
        className="float-right"
        onClick={handleOpen}
        startIcon={<PublishIcon />}
      >
        {buttonTitle}
      </Button>

      <Dialog
        fullScreen
        scroll="body"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <AppBar>
          <Toolbar>
            <IconButton
              onClick={handleClose}
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <CloseOutlined></CloseOutlined>
            </IconButton>
            <Typography variant="h6">{dialogTitle}</Typography>
            <div className="btn-bulk-appbar">
              {!finalMessage && (
                <Button
                  disabled={activeStep === 0 || isLoading}
                  onClick={handleBack}
                >
                  {t("back")}
                </Button>
              )}
              <Button
                disabled={isLoading}
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? t("close") : t("next")}
              </Button>
            </div>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <div>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <div>
              {activeStep === 0 && (
                <Box marginTop={2}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        <ul>
                          <li>{t("bulk_filetype")}</li>
                          <li>{t("bulk_filesize")}</li>
                          <li>{t("bulk_filelines")}</li>
                          <li>
                            <a href={`/csvtemplate/` + entity + `.csv`}>
                              {t("bulk_templatedownload")}
                            </a>
                          </li>
                        </ul>
                      </Typography>
                      {errorsMessages && (
                        <Typography color="error" gutterBottom>
                          <ul>
                            {errorsMessages.map((item, i) => (
                              <li>{item}</li>
                            ))}
                          </ul>
                        </Typography>
                      )}
                      <DropzoneAreaBase
                        fileObjects={fileObjects}
                        onAdd={handleAdd}
                        onDelete={handleDelete}
                        filesLimit={filesLimit}
                        maxFileSize={10000000}
                        initialFiles={files}
                        showPreviews={true}
                        showPreviewsInDropzone={false}
                        useChipsForPreview
                        previewText={t("bulk_step1_content_selected_files")}
                        dropzoneText={t("bulk_step1_content_upload_text")}
                        //acceptedFiles={["text/plain","text/csv", "text/x-csv" , "application/vnd.ms-excel"]}
                        getFileAddedMessage={(fileName) =>
                          t("dropzone_file_added").replace(
                            "${fileName}",
                            fileName
                          )
                        }
                        getFileRemovedMessage={(fileName) =>
                          t("dropzone_file_removed").replace(
                            "${fileName}",
                            fileName
                          )
                        }
                        getFileLimitExceedMessage={(filesLimit) =>
                          t("dropzone_file_limit_exceed").replace(
                            "${filesLimit}",
                            filesLimit
                          )
                        }
                        alertsnackbarProps={{
                          autoHideDuration: 3000,
                          anchorOrigin: {
                            vertical: "top",
                            horizontal: "center",
                          },
                        }}
                        getDropRejectMessage={(
                          rejectedFile,
                          acceptedFiles,
                          maxFileSize
                        ) => {
                          let message = t("file_rejected").replace(
                            "${fileName}",
                            rejectedFile.name
                          );
                          if (!acceptedFiles.includes(rejectedFile.type)) {
                            message += t("dropzone_filetype_not_suported");
                          }
                          if (rejectedFile.size > maxFileSize) {
                            message += t("file_too_big").replace(
                              "${maxFileSize}",
                              convertBytesToMbsOrKbs(maxFileSize)
                            );
                          }
                          return message;
                        }}
                      />
                    </CardContent>
                  </Card>
                </Box>
              )}
              {activeStep === 1 && (
                <>
                  {!isAsync && (
                    <CsvToHtmlTable
                      data={fileData}
                      csvDelimiter=","
                      tableClassName="table table-striped table-hover"
                      t={t}
                    />
                  )}
                  {isAsync && !finalMessage && (
                    <Box marginTop={2}>
                      <Card>
                        <CardContent>
                          <Typography
                            align="center"
                            color="textSecondary"
                            gutterBottom
                          >
                            {t("bulk_async_message")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                  {isAsync && finalMessage && (
                    <>
                      <Box marginTop={2}>
                        <Card>
                          <CardContent>
                            <Typography
                              align="center"
                              color="textSecondary"
                              gutterBottom
                            >
                              {finalMessage}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </>
                  )}
                  {isAsync && isLoading && <Loader />}
                </>
              )}
              {activeStep === 2 && (
                <div className="complete-bulk">
                  {isLoading && <Loader />}
                  {finalMessage && (
                    <>
                      <Typography color="textSecondary" gutterBottom>
                        {finalMessage}
                      </Typography>
                    </>
                  )}
                  {finalResult && (
                    <ul className="results-bulk">
                      <li>
                        {t("Total")} :{" "}
                        <span className="totals-results">
                          {finalResult.length}
                        </span>
                      </li>
                      <li>
                        {t("Success")} :{" "}
                        <span className="success-results">
                          {finalResult.reduce(function (n, val) {
                            return n + (val[1] === 0);
                          }, 0)}
                        </span>
                      </li>
                      <li>
                        {t("Error")} :{" "}
                        <span className="error-results">
                          {finalResult.reduce(function (n, val) {
                            return n + (val[1] === 1);
                          }, 0)}
                        </span>
                      </li>
                    </ul>
                  )}
                  {finalResult && (
                    <CsvToHtmlTable
                      data={fileData}
                      result={finalResult}
                      csvDelimiter=","
                      tableClassName="table table-striped table-hover"
                      t={t}
                    />
                  )}
                </div>
              )}

              <div className="btn-bulk">
                {!finalMessage && (
                  <Button
                    disabled={activeStep === 0 || isLoading}
                    onClick={handleBack}
                  >
                    {t("back")}
                  </Button>
                )}

                <Button
                  disabled={isLoading}
                  variant="contained"
                  color="primary"
                  onClick={() => handleNext()}
                >
                  {activeStep === steps.length - 1 ? t("close") : t("next")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

CsvBulkUpload.propTypes = {
  entity: PropTypes.any.isRequired,
  t: PropTypes.any.isRequired,
  bulk_upload_title: PropTypes.any.isRequired,
  bulk_donwload_title: PropTypes.any.isRequired,
  bulk_dialog_title: PropTypes.any.isRequired,
  bulk_step1_title: PropTypes.any.isRequired,
  bulk_step2_title: PropTypes.any.isRequired,
  bulk_step3_title: PropTypes.any.isRequired,
  validate: PropTypes.any.isRequired,
  online: PropTypes.any.isRequired,
  search: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
};

export default CsvBulkUpload;
