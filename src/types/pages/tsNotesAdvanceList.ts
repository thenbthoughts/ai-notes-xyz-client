/** AM4 merged stream payloads (`answer_machine_v4_stream`). Legacy `answer_machine_v3_stream` rows may exist in history. */
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

    /** Synthetic notesGet row for Answer Machine pipeline (not a stored chat LLM doc). */
    streamPayload?: AnswerMachineV4StreamPayload;
}