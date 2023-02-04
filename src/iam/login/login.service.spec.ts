import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '../../shared/hashing/bcrypt.service';
import { HashingService } from '../../shared/hashing/hashing.service';
import { LoginService } from './login.service';
import { UsersService } from '../../users/users.service';
import { Users } from '../../users/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';

const oneUser = {
  id: 1,
  name: 'name #1',
  username: 'username #1',
  email: 'test@example.com',
  password: 'pass123',
};

const loginDto: LoginDto = {
  email: 'test@example.com',
  password: 'pass123',
};

const userLogin = {
  sub: 1,
  user: {
    id: 1,
    name: 'name #1',
    email: 'test@example.com',
  },
  status: 200,
};

const payload = {
  id: 1,
  name: 'name #1',
  email: 'test@example.com',
};

describe('LoginService', () => {
  let loginService: LoginService;
  let usersService: UsersService;
  let repository: Repository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            signToken: jest.fn(() => payload),
          },
        },
        ConfigService,
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(() => 'pass123'),
            compare: jest.fn(() => 'pass123'),
          },
        },
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findByEmail: jest.fn(),
            findOneBy: jest.fn().mockReturnValue(oneUser),
            findOne: jest.fn().mockReturnValue(oneUser),
          },
        },
      ],
    }).compile();

    loginService = module.get<LoginService>(LoginService);
    usersService = module.get<UsersService>(UsersService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  it('should be defined', () => {
    expect(loginService).toBeDefined();
  });

  describe('findUserByEmail() method', () => {
    it('should find a user by email', async () => {
      expect(await loginService.findUserByEmail(loginDto)).toEqual(oneUser);
    });

    it('should generate token jwt', async () => {
      expect(await loginService.login(loginDto)).toEqual(userLogin);
    });
    // it('should throw an exception if it not found a user by id', async () => {
    //   jest
    //     .spyOn(service, 'findById')
    //     .mockRejectedValueOnce(new NotFoundException('User anyid not found'));
    //   await expect(service.findById('anyid')).rejects.toThrow(
    //     new NotFoundException('User anyid not found'),
    //   );
    // });
  });
});
