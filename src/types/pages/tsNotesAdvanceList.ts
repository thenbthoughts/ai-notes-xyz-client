export type AnswerMachineV3StreamPayload =
    | {
          kind: 'iteration';
          /**
           * Groups steps for one outer request iteration. Server uses `synth-{requestId}-{iterationNumber}`.
           * Legacy rows may still carry a Mongo ObjectId string from older APIs.
           */
          iterationDocId?: string;
          requestId?: string;
          iterationNumber: number;
          status: string;
          errorReason: string;
          /** Optional; merged from `answerMachinePipelineVisualV3` on the server. */
          inputImageStoredFileUrl?: string;
          outputImageStoredFileUrl?: string;
          /** From previous outer iteration: evaluator reason (merged from `answerMachineEvaluateAnswerV3`). */
          priorIterationEvaluationReason?: string;
          /** Truncated prior-iteration final draft (`answerMachineRequestV3.intermediateAnswers`). */
          priorIterationDraftExcerpt?: string;
          /** Whether the evaluator marked the prior iteration’s answer satisfactory (still continued if min/max iterations). */
          priorIterationWasSatisfactory?: boolean | null;
          /** Truncated request-level global task (merged from `answerMachineRequestV3`). */
          globalTaskDescriptionExcerpt?: string;
          outerIterationMax?: number;
          /** Further outer iterations allowed after this pass completes. */
          outerIterationsRemaining?: number;
      }
    | {
          kind: 'sub_question';
          /** Same grouping key as the parent iteration row (synthetic or legacy). */
          iterationDocId?: string;
          requestId?: string;
          iterationNumber?: number;
          question: string;
          answer: string;
          status: string;
          subKind: string;
          stepIndex?: number;
          attemptNumber?: number;
          verificationVerdict?: string;
          verificationReason?: string;
          verificationAllImpliedSubtasksDone?: boolean;
          verificationFinalAnswerDeliverable?: boolean;
          verificationGlobalTaskChecklist?: string;
          executedShellCommand?: string;
          shellExecutionSuccess?: boolean;
          shellExecutionExitCode?: number | null;
          shellExecutionTimedOut?: boolean;
          shellExecutionStderrPreview?: string;
          shellRetryGuidance?: string;
      }
    | {
          kind: 'final_answer';
          requestId: string;
          answerText: string;
      }
    | {
          kind: 'file_artifact';
          requestId: string;
          fileDocId: string;
          /** Synthetic `synth-…` key, legacy ObjectId, or empty when only subQuestionDocId is set. */
          iterationDocId?: string;
          subQuestionDocId: string;
          storedFileUrl: string;
          mimeType: string;
          originalName: string;
          purpose: string;
          description: string;
          fileType: string;
      };

/** AM4 merged stream payloads (`answer_machine_v4_stream`). */
export type AnswerMachineV4StreamPayload =
    | {
          kind: 'iteration';
          iterationDocId?: string;
          requestId?: string;
          iterationNumber: number;
          status: string;
          errorReason?: string;
          priorIterationEvaluationReason?: string;
          priorIterationDraftExcerpt?: string;
          priorIterationWasSatisfactory?: boolean | null;
          globalTaskDescriptionExcerpt?: string;
          outerIterationMax?: number;
          outerIterationsRemaining?: number;
          /** OpenCode session id for this AM4 run (from request). */
          opencodeSessionId?: string;
          attachedFiles?: Array<{
              fileDocId: string;
              fileName: string;
              mimeType: string;
              containerPath: string;
              shellRelativePath: string;
              uploadStatus: string;
              fileRole: string;
              storedFileUrl: string;
          }>;
      }
    | {
          kind: 'sub_question';
          iterationDocId?: string;
          requestId?: string;
          iterationNumber?: number;
          question: string;
          answer: string;
          status: string;
          subKind: string;
          stepIndex?: number;
          attemptNumber?: number;
          verificationVerdict?: string;
          verificationReason?: string;
          verificationAllImpliedSubtasksDone?: boolean;
          verificationFinalAnswerDeliverable?: boolean;
          verificationGlobalTaskChecklist?: string;
          contextFilesUsed?: string[];
      }
    | {
          kind: 'final_answer';
          requestId: string;
          answerText: string;
      }
    | {
          kind: 'file_artifact';
          requestId: string;
          fileDocId: string;
          iterationDocId?: string;
          subQuestionDocId: string;
          storedFileUrl: string;
          mimeType: string;
          originalName: string;
          purpose: string;
          description: string;
          fileType: string;
          containerPath?: string;
          shellRelativePath?: string;
          uploadStatus?: string;
          fileRole?: string;
      };

export interface tsMessageItem {
    _id: string;
    
    // identification - pagination
    dateTimeUtc: Date | null;
    paginationDateLocalYearMonthStr: string;
    paginationDateLocalYearMonthDateStr: string;

    type: string;
    content: string;
    reasoningContent: string;
    username: string;
    tags: string[];
    visibility: string;
    fileUrlArr: string[];

    // file
    fileUrl: string;
    fileContentText: string;
    fileContentAi: string;

    // model info
    isAi: boolean;
    aiModelName: string;
    aiModelProvider: string;

    // auto
    userAgent: string;
    tagsAutoAi: string[];

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;

    // Life event specific fields (added)
    title?: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    category?: string;
    subcategory?: string;
    priority?: string;
    status?: string;
    starred?: boolean;

    // stats
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    totalTokens: number;
    costInUsd: number;

    /** Present on shell-run assistant messages; used to preview imported binaries (PDF, HTML, …). */
    shellRunArtifactV1?: {
        importedFiles?: Array<{
            fileName: string;
            mimeType?: string;
            storedFileUrl: string;
        }>;
    };

    /** Synthetic notesGet row for Answer Machine V3/V4 pipeline (not a stored chat LLM doc). */
    streamPayload?: AnswerMachineV3StreamPayload | AnswerMachineV4StreamPayload;
}