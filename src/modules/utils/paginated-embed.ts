import type {
  InteractionEditReplyOptions,
  ChatInputCommandInteraction,
  APIActionRowComponent,
  APIButtonComponentWithCustomId,
  Message,
} from "discord.js";
import { ButtonStyle, ComponentType } from "discord.js";
import { produce } from "immer";

export default class PaginatedEmbedMessage<T> {
  private pageIndex: number = 0;
  private isActive: boolean = true;
  private message?: Message<boolean>;

  readonly items: T[];
  readonly builder: BuilderFunction<T>;
  readonly pageSize: number = 10;
  readonly maxPageIndex: number;
  private paginationRowComponents: APIActionRowComponent<APIButtonComponentWithCustomId> =
    {
      type: ComponentType.ActionRow,
      components: [
        {
          custom_id: "first",
          emoji: { name: "⏮" },
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
        },
        {
          custom_id: "prev",
          emoji: { name: "◀" },
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
        },
        {
          custom_id: "next",
          emoji: { name: "▶" },
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
        },
        {
          custom_id: "last",
          emoji: { name: "⏭" },
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
        },
      ],
    };

  hasPrevious(page: number): boolean {
    return page !== 0;
  }

  hasNext(page: number): boolean {
    return page !== this.maxPageIndex;
  }

  constructor(
    data: PaginatedEmbedMessageData<T>,
    options?: Partial<PaginatedEmbedMessageOptions>
  ) {
    if (options !== undefined) {
      this.pageSize = options.pageSize || this.pageSize;
    }

    this.items = data.content;
    this.maxPageIndex = Math.ceil(this.items.length / this.pageSize) - 1;
    this.builder = data.builder;
  }

  pageBuilder(page: number): InteractionEditReplyOptions {
    const items = this.items.slice(
      page * this.pageSize,
      (page + 1) * this.pageSize
    );

    const actionRow = produce(this.paginationRowComponents, (cmps) => {
      for (const button of cmps.components) {
        button.disabled = !this.isActive;
        if (button.custom_id === "prev") {
          button.disabled = !this.hasPrevious(page);
        }
        if (button.custom_id === "next") {
          button.disabled = !this.hasNext(page);
        }
      }
    });

    return {
      ...this.builder(items, {
        curPage: page,
        maxPage: this.maxPageIndex,
        pageSize: this.pageSize,
        total: this.items.length,
      }),
      components: [actionRow],
    };
  }

  public async sendMessage(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean>> {
    this.isActive = true;
    this.message = await interaction.editReply(this.pageBuilder(0));

    const collector = this.message!.createMessageComponentCollector({
      time: 0.1 * 60 * 1_000,
    });

    collector.on("collect", async (action) => {
      if (!action.isButton()) return;

      switch (action.customId) {
        case "first":
          this.pageIndex = 0;
          await action.update(this.pageBuilder(this.pageIndex));
          break;

        case "prev":
          if (this.hasPrevious(this.pageIndex)) {
            await action.update(this.pageBuilder(--this.pageIndex));
          }

          break;

        case "next":
          if (this.hasNext(this.pageIndex)) {
            await action.update(this.pageBuilder(++this.pageIndex));
          }
          break;

        case "last":
          this.pageIndex = this.maxPageIndex;
          await action.update(this.pageBuilder(this.pageIndex));
          break;

        default:
          break;
      }
    });

    collector.on("end", async () => {
      this.isActive = false;
      const actionRow = produce(this.paginationRowComponents, (row) => {
        for (const button of row.components) {
          button.disabled = true;
        }
      });
      await this.message!.edit({ components: [actionRow] });
    });

    return this.message;
  }
}