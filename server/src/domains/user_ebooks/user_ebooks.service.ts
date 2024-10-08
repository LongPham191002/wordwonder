import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserEbookDto } from './dto/create-user_ebook.dto';
import { UpdateUserEbookDto } from './dto/update-user_ebook.dto';
import { UserEbook } from './entities/user_ebook.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserEbooksService {
  constructor(
    @InjectRepository(UserEbook)
    private readonly userEbookRepository: Repository<UserEbook>,
  ) {}

  async create(userId: string, createUserEbookDto: CreateUserEbookDto) {
    try {
      let newUserEbook = this.userEbookRepository.create(createUserEbookDto);
      newUserEbook.user = userId as any;
      newUserEbook.ebook = createUserEbookDto.ebook;
      newUserEbook.readingStatus = createUserEbookDto.readingStatus;
      newUserEbook.purchaseDate = Date.now().toString();
      await this.userEbookRepository.save(newUserEbook);
      return;
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }

  async listUserHistory(userId: string) {
    try {
      return await this.userEbookRepository
        .createQueryBuilder('userEbook')
        .leftJoinAndSelect('userEbook.ebook', 'ebook')
        .select([
          'userEbook.readingStatus',
          'userEbook.purchaseDate',
          'ebook.id',
          'ebook.name',
          'ebook.imageUrl',
          'ebook.author',
        ])
        .where('userEbook.userId = :userId', { userId })
        .getMany();
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }

  async findOneByEbookIdAndUserId(ebookId: string, userId: string) {
    try {
      let result = await this.userEbookRepository
        .createQueryBuilder('UserEbook')
        .leftJoinAndSelect('UserEbook.ebook', 'ebook')
        .leftJoinAndSelect('UserEbook.user', 'user')
        .select([
          'UserEbook',
          'ebook.id',
          'ebook.name',
          'user.id',
          'user.nickName',
          'user.photoURL',
          'UserEbook.isLiked',
        ])
        .where('UserEbook.userId = :userId', { userId })
        .andWhere('UserEbook.ebookId = :ebookId', { ebookId })
        .getOne();
      if (!result) {
        throw new HttpException('UserEbook not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  // async update(
  //   userId: string,
  //   ebookId: string,
  //   updateUserEbookDto: UpdateUserEbookDto,
  // ) {
  //   try {
  //     await this.userEbookRepository
  //       .createQueryBuilder()
  //       .update(UserEbook)
  //       .set(updateUserEbookDto)
  //       .where('userId = :userId AND ebookId = :ebookId', { userId, ebookId })
  //       .execute();
  //     return;
  //   } catch (e) {
  //     throw new HttpException(e, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async remove(userId: string, ebookId: string) {
    try {
      await this.userEbookRepository
        .createQueryBuilder()
        .delete()
        .from(UserEbook)
        .where('userEbook.userId = :userId', { userId })
        .andWhere('userEbook.ebookId = :ebookId', { ebookId })
        .execute();
      return;
    } catch {
      throw new HttpException('Delete fail', 400);
    }
  }
}
