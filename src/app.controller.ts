import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { CalculateService } from './calculate/calculate.service';
import { CommentService } from './comment/comment.service';
import { ContactService } from './contact/contact.service';
import { PortfolioService } from './portfolio/portfolio.service';
import { StartService } from './start/start.service';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly startService: StartService,
    private readonly commentService: CommentService,
    private readonly contactService: ContactService,
    private readonly portfolioService: PortfolioService,
    private readonly calculateService: CalculateService,
    private readonly userService: UserService,
  ) {}

  @Get('ping')
  ping() {
    return { status: 'ok', message: 'Все ОК' };
  }

  @Get('start')
  @UseGuards(AuthGuard)
  async getStart() {
    const start = await this.startService.getStart();
    if (!start) {
      return null;
    }
    return start;
  }

  @Post('start')
  @UseGuards(AuthGuard)
  async updateStart(
    @Body()
    body: {
      content: string;
      buttons?: Array<{ text: string; callback_data: string }>;
    },
  ) {
    return await this.startService.updateStart(body.content, body.buttons);
  }

  @Get('comments')
  @UseGuards(AuthGuard)
  async getComments() {
    return await this.commentService.getAllComments();
  }

  @Post('comments')
  @UseGuards(AuthGuard)
  async createComment(
    @Body()
    body: {
      name: string;
      date: string;
      text: string;
    },
  ) {
    return await this.commentService.createComment(
      body.name,
      body.date,
      body.text,
    );
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('id') id: string) {
    const deleted = await this.commentService.deleteComment(parseInt(id, 10));
    return { success: deleted };
  }

  @Get('contacts')
  @UseGuards(AuthGuard)
  async getContacts() {
    const contact = await this.contactService.getContact();
    if (!contact) {
      return null;
    }
    return contact;
  }

  @Post('contacts')
  @UseGuards(AuthGuard)
  async updateContacts(
    @Body()
    body: {
      address: string;
      managerText: string;
      buttons?: Array<{
        text: string;
        url: string;
      }>;
    },
  ) {
    return await this.contactService.updateContact(
      body.address,
      body.managerText,
      body.buttons,
    );
  }

  @Get('portfolios')
  @UseGuards(AuthGuard)
  async getPortfolios() {
    return await this.portfolioService.getAllPortfolios();
  }

  @Post('portfolios')
  @UseGuards(AuthGuard)
  async createPortfolio(
    @Body()
    body: {
      imageSrc: string;
      title: string;
      description: string;
    },
  ) {
    return await this.portfolioService.createPortfolio(
      body.imageSrc,
      body.title,
      body.description,
    );
  }

  @Delete('portfolios/:id')
  @UseGuards(AuthGuard)
  async deletePortfolio(@Param('id') id: string) {
    const deleted = await this.portfolioService.deletePortfolio(
      parseInt(id, 10),
    );
    return { success: deleted };
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers(@Query('skip') skip?: string, @Query('take') take?: string) {
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return await this.userService.getAllUsers(skipNum, takeNum);
  }

  @Get('calculate')
  @UseGuards(AuthGuard)
  async getCalculate(): Promise<{
    id: string;
    step1Question: string;
    step1Options: string[];
    step2Question: string;
    step2Options: string[];
    step3Question: string;
    step4Question: string;
    step4Options: string[];
    step5ContactPrompt: string;
    finalMessage: string;
  } | null> {
    const calculate = await this.calculateService.getCalculate();
    if (!calculate) {
      return null;
    }
    return {
      id: calculate.id,
      step1Question: calculate.step1Question,
      step1Options: calculate.step1Options
        ? (JSON.parse(calculate.step1Options) as string[])
        : [],
      step2Question: calculate.step2Question,
      step2Options: calculate.step2Options
        ? (JSON.parse(calculate.step2Options) as string[])
        : [],
      step3Question: calculate.step3Question,
      step4Question: calculate.step4Question,
      step4Options: calculate.step4Options
        ? (JSON.parse(calculate.step4Options) as string[])
        : [],
      step5ContactPrompt: calculate.step5ContactPrompt,
      finalMessage: calculate.finalMessage,
    };
  }

  @Post('calculate')
  @UseGuards(AuthGuard)
  async updateCalculate(
    @Body()
    body: {
      step1Question?: string;
      step1Options?: string[];
      step2Question?: string;
      step2Options?: string[];
      step3Question?: string;
      step4Question?: string;
      step4Options?: string[];
      step5ContactPrompt?: string;
      finalMessage?: string;
    },
  ) {
    return await this.calculateService.updateCalculate(body);
  }
}
